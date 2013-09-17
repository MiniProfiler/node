/*
 *  Miniprofiler implementation for node.js.
 *  
 *  Apache License, Version 2.0
 *
 *  Kevin Montrose, 2013
 *  Matt Jibson, 2013
 */

var _ = require('./ui/underscore.js');
var fs = require('fs');
var os = require('os');
var path = require('path');
var qs = require('querystring');
var url = require('url');

_.templateSettings = {
	interpolate: /\{(.+?)\}/g
};

// EXPORTS
exports.configure = configure;
exports.instrument = addProfilingInstrumentation;
exports.profile = middleware;

// GLOBALS
var storage = function(id, json) {
	this.results = this.results || [];

	if(json) {
		if(this.results.length > 20) {
			this.results = this.results.slice(1);
		}

		this.results.push({ id: id, json: json });

		return;
	}

	for(var i = 0; i < this.results.length; i++) {
		var res = this.results[i];

		if(res.id == id) return res.json;
	}

	return null;
};
var ignoredPaths = [];
var trivialDurationThresholdMilliseconds = 2.5;
var popupShowTimeWithChildren = false;
var popupRenderPosition = 'left';
var configured = false;

var includesDir = path.join(path.dirname(module.filename), 'ui');
var resourcePath = '/mini-profiler-resources/';
var version = '';

// INCLUDES

var contentTypes = {
	css: 'text/css',
	js: 'text/javascript'
};
function static(reqPath, res) {
	fs.readFile(path.join(includesDir, reqPath), function(err, data) {
		if(err) {
			res.writeHead(404);
			res.end(JSON.stringify(err));
			return;
		}
		var rs = reqPath.split('.');
		res.setHeader("Content-Type", contentTypes[rs[rs.length - 1]]);
		res.writeHead(200);
		res.end(data);
	});
}

var util = require('util');

function results(req, res) {
	proc = function(post) {
		// todo: store client timings
		var id = post.id || url.parse(req.url, true).query.id;
		var s = storage(id);
		if (post.popup == "1")
			res.end(s);
		else {
			var j = JSON.parse(s);
			res.setHeader("Content-Type", "text/html");
			res.end(includes.share({
				name: j.Name,
				duration: j.DurationMilliseconds,
				path: resourcePath,
				json: s,
				includes: include(id),
				version: version
			}));
		}
	};
	if(req.body) {
		proc(req.body);
		return;
	}
	var body = '';
	req.on('data', function(data) {
		body += data;
		if (body.length > 1e6)
			req.connection.destroy();
	});
	req.on('end', function() {
		var post = qs.parse(body);
		proc(post);
	});
}

var includes = {
	partial: _.template(fs.readFileSync(path.join(includesDir, 'include.partial.html')).toString()),
	share: _.template(fs.readFileSync(path.join(includesDir, 'share.html')).toString())
};

// FUNCTIONS

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

function middleware(f) {
	if(!f) f = function() { return true; };
	return function(req, res, next) {
		if(!configured) configure();
		var enabled = f(req, res);

		if(req.path.startsWith(resourcePath)) {
			if (!enabled) {
				res.send(404);
				return;
			}
			var sp = req.path.split('/');
			var reqPath = sp[sp.length - 1];
			if(reqPath == 'results')
				results(req, res);
			else
				static(reqPath, res);
			return;
		}
		if (enabled) {
			res.on('header', function() {
				stopProfiling(req);
			});
			res.setHeader("X-MiniProfiler-Ids", '["' + id + '"]');
		}
		var id = startProfiling(req, enabled);
		next();
	};
}

function include(id) {
	// not profiling
	if(!id) {
		return null;
	}
	return includes.partial({
		path: resourcePath,
		position: popupRenderPosition,
		showChildren: popupShowTimeWithChildren,
		trivialMilliseconds: trivialDurationThresholdMilliseconds,

		version: version,
		currentId: id,
		ids: id,
		showTrivial: true,
		maxTracesToShow: 15,
		showControls: true,
		authorized: true,
		toggleShortcut: '',
		startHidden: false
	});
}

/*
 * Setup profiling.  This function may only be called once, subsequent calls are ignored.
 *
 * This must be called before the first call to startProfiling.
 *
 * options is an optional object, which can have the following fields:
 *  - storage: function(id[, json]) ; called to store (if json is present) or fetch (if json is omitted) a string JSON blob of profiling information
 *  - ignoredPaths: string array ; any request whose `url` property is in ignoredPaths will not be profiled
 *  - trivialDurationThresholdMilliseconds: double ; any step lasting longer than this will be considered trivial, and hidden by default
 *  - popupShowTimeWithChildren: boolean ; whether or not to include the "time with children" column
 *  - popupRenderPosition: 'left' or 'right' ; which side of the screen to display timings on
 */
function configure(options){
	if(configured) return;

	if(options) {
		storage = options.storage || storage;
		ignoredPaths = options.ignoredPaths || ignoredPaths;
		trivialDurationThresholdMilliseconds = options.trivialDurationThresholdMilliseconds || trivialDurationThresholdMilliseconds;
		popupShowTimeWithChildren = options.popupShowTimeWithChildren || popupShowTimeWithChildren;
		popupRenderPosition = options.popupRenderPosition || popupRenderPosition;
	}

	configured = true;
}

function getProfiling(id){
	return storage(id);
}

/*
 * Modifies `toInstrument` such that each function has been instrumented for miniprofiler purposes.
 * 
 *
 * Descends recursively, but will terminate even if there are cycles in the object graph.
 *
 * Adds `miniprofiler_instrumented` to `toInstrument`, any contained objects, and any contained functions.
 */
function addProfilingInstrumentation(toInstrument) {
	if(!toInstrument){
		throw new Error('toInstrument must be set');
	}

	if(!isObject(toInstrument)) {
		throw new Error('toInstrument must be an object');
	}

	if(!toInstrument.miniprofiler_instrumented)
	{
		addProfilingImpl(toInstrument);
	}

	return toInstrument;
}

/*
 * Begins profiling the given request.
 */
function startProfiling(request, enabled) {
	if(!configured) throw new Error('configure() must be called before the first call to startProfiling');

	var currentRequestExtension = {
		enabled: enabled
	};

	if (enabled) {
		currentRequestExtension.startDate = Date.now();
		currentRequestExtension.startTime = process.hrtime();
		currentRequestExtension.stopTime = null;
		currentRequestExtension.stepGraph = makeStep(request.path, currentRequestExtension.startTime, null);
		currentRequestExtension.id = makeGuid();
		currentRequestExtension.customTimings = {};
	}
	currentRequestExtension.timeQuery = function() {
		var args = Array.prototype.slice.call(arguments, enabled ? 0 : 3);
		if (enabled) {
			args.unshift(currentRequestExtension);
			timeQuery.apply(this, args);
		} else {
			arguments[2].apply(this, args);
		}
	};
	currentRequestExtension.step = function(name, call) {
		var args = Array.prototype.slice.call(arguments, enabled ? 0 : 2);
		if (enabled) {
			step(name, request, call);
		} else {
			call();
		}
	};
	currentRequestExtension.include = function() {
		return enabled ? include(currentRequestExtension.id) : '';
	};

	request.miniprofiler = currentRequestExtension;
	return currentRequestExtension.id;
}

/*
 * Stops profiling the given request.
 */
function stopProfiling(request){
	// not profiling
	if (!request.miniprofiler.enabled) return null;

	var extension = request.miniprofiler;
	var time = process.hrtime();
	if(extension.stepGraph.parent != null){
		throw new Error('profiling ended while still in a function, was left in ['+extension.stepGraph.name+']');
	}

	extension.stopTime = time;
	extension.stepGraph.stopTime = time;

	// get those references gone, we can't assume much about GC here
	// (is the above comment still true? is this line needed? - mjibson)
	delete request.miniprofiler

	var json = describePerformance(extension, request);
	var ret = extension.id;

	storage(ret, JSON.stringify(json));

	return ret;
}

/*
 * Wraps an invokation of `call` in a step named `name`.
 *
 * You should only use this method directly in cases when calls to addProfiling won't suffice.
 */
function step(name, request, call) {
	var time = process.hrtime();

	var extension = request.miniprofiler;

	var newStep = makeStep(name, time, extension.stepGraph);
	extension.stepGraph.steps.push(newStep);
	extension.stepGraph = newStep;

	var failed = false;

	var result;

	try {
		result = call();
	} catch(e) {
		failed = true;
		throw e;
	} finally {
		unstep(name, request, failed);
	}

	return result;
}

/*
 *	Called to time a query, like to SQL or Redis, that completes with a callback
 *
 *  `type` can be any string, it is used to group query types in timings.
 *  `query` is a string representing the query, this is what is recorded as having run.
 *
 *  `executeFunction` is invoked with any additional parameters following it.
 *
 *  Any function passed as a parameter to `executeFunction` will be instrumented to detect
 *  when the query has completed.  Implicitly, any execution of a callback is considered
 *  to have ended the query.
 */
function timeQuery(extension, type, query, executeFunction) {
	var time = process.hrtime();
	var startDate = Date.now();

	var params = Array.prototype.slice.call(arguments, 4);

	if(!extension.stepGraph.customTimings[type]) {
		extension.stepGraph.customTimings[type] = [];
	}

	var customTiming = { 
		id: makeGuid(), 
		executeType: type, 
		commandString: htmlEscape(query), 
		startTime: time,
		startDate: startDate,
		callStack: new Error().stack
	};
	extension.stepGraph.customTimings[type].push(customTiming);

	for(var i = 0; i < params.length; i++){
		var param = params[i];
		if(isFunction(params[i])){
			params[i] = function() {
				customTiming.stopTime = process.hrtime();

				var ret = param.apply(this, arguments);

				return ret;
			};
		}
	}

	var ret = executeFunction.apply(this, params);

	return ret;
}

function htmlEscape(str) {
	return String(str)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
}

function unstep(name, request, failed) {
	var time = process.hrtime();

	var extension = request.miniprofiler;

	if(extension.stepGraph.name != name){
		throw new Error('profiling stepped out of the wrong function, found ['+name+'] expected ['+extension.stepGraph.name+']');
	}

	extension.stepGraph.stopTime = time;
	if(failed) extension.failed = true;

	// step back up
	extension.stepGraph = extension.stepGraph.parent;
}

function makeGuid() {
	// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
}

function describePerformance(root, request) {
	var ret = {};
	
	ret.Id = root.id;
	ret.Name = request.path;
	ret.Started = root.startDate;
	ret.MachineName = os.hostname();
	ret.Root = describeTimings(root.stepGraph, root.stepGraph);
	ret.ClientTimings = null;
	ret.DurationMilliseconds = ret.Root.DurationMilliseconds;

	return ret;
}

function diff(start, stop){
	if (!stop) {
		stop = process.hrtime();
		console.error('missing stop, using', stop);
	}
	var deltaSecs = stop[0] - start[0];
	var deltaNanoSecs = stop[1] - start[1];

	var elapsedMs = deltaSecs * 1000 + deltaNanoSecs / 1000000;

	return elapsedMs;
}

function callStack(stack) {
	var sp = stack.split('\n');
	var ret = [];
	for(var i = 2; i < sp.length; i++) {
		var st = sp[i].trim().split(' ');
		ret.push(st[1]);
	}
	return ret.join(' ');
}

function describeTimings(timing, root){
	var id = makeGuid();
	var name = timing.name;
	var elapsedMs = diff(timing.startTime, timing.stopTime);
	var sinceRootMs = diff(root.startTime, timing.startTime);
	var customTimings = describeCustomTimings(timing.customTimings, root);

	var children = [];
	for(var i = 0; i < timing.steps.length; i++){
		var step = timing.steps[i];
		children.push(describeTimings(step, root));
	}

	return {
		Id: id,
		Name: name,
		DurationMilliseconds: elapsedMs,
		StartMilliseconds: sinceRootMs,
		Children: children,
		CustomTimings: customTimings
	};
}

function describeCustomTimings(customTimings, root) {
	var ret = {};
	for(var prop in customTimings) {
		if(!customTimings.hasOwnProperty(prop)) continue;

		var arr = customTimings[prop];
		var retArr = [];

		for(var i = 0; i < arr.length; i++) {
			var timing = {};
			timing.Id = arr[i].id;
			timing.ExecuteType = arr[i].executeType;
			timing.CommandString = arr[i].commandString;
			timing.StartMilliseconds = diff(root.startTime, arr[i].startTime);
			timing.DurationMilliseconds = diff(arr[i].startTime, arr[i].stopTime);
			timing.StackTraceSnippet = callStack(arr[i].callStack);

			retArr.push(timing);
		}

		ret[prop] = retArr;
	}

	return ret;
}

function makeStep(name, time, parent){
	return { name: name, startTime: time, stopTime: null, parent: parent, steps: [], customTimings: {} };
}

function isObject(val) {
	return Function.prototype.call.bind(Object.prototype.toString)(val) == '[object Object]';
}

function isFunction(func) {
	var getType = {};
	return getType.toString.call(func) === '[object Function]';
}

function instrument(func, defaultName) {
	var name = func.name || defaultName || 'Unnamed';

	var ret = function() {
		var toApply = func;
		var that = this;
		var args = Array.prototype.slice.call(arguments);

		if(args) {
			for(var i = 0; i < args.length; i++){
				var arg = args[i];
				if(arg && isFunction(arg)){
					args[i] = instrument(arg, name+' arg #'+i);
				}
			}
		}

		return step(
				name,
				function() {
					var ret = toApply.apply(that, args);

					return ret;
				}
			);
	};

	ret.miniprofiler_instrumented = true;

	return ret;
}

function addProfilingImpl(toInstrument) {
	if(toInstrument.miniprofiler_instrumented) {
		throw new Error('already instrumented');
	}

	toInstrument.miniprofiler_instrumented = true;

	for(var prop in toInstrument) {
		if(!toInstrument.hasOwnProperty(prop)) continue;

		var toWrap = toInstrument[prop];

		if(!toWrap || toWrap.miniprofiler_instrumented) continue;

		if(Array.isArray(toWrap)){
			for(var i = 0; i < toWrap.length; i++) {
				var member = toWrap[i];
				if(member.miniprofiler_instrumented) continue;

				addProfilingImpl(member);
			}

			continue;
		}

		if(isObject(toWrap)) {
			addProfilingImpl(toWrap);

			continue;
		}

		if(isFunction(toWrap)) {
			var wrappedFunc = instrument(toWrap, prop);

			toInstrument[prop] = wrappedFunc;

			continue;
		}
	}
}