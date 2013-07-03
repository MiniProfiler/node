/*
 *  Miniprofiler implementation for node.js.
 *  
 *  Apache License, Version 2.0
 *
 *  Kevin Montrose, 2013
 */

var domain = require('domain');

// EXPORTS
exports.configure = configure;
exports.instrument = addProfilingInstrumentation;
exports.startProfiling = startProfiling;
exports.stopProfiling = stopProfiling;
exports.step = step;

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

// FUNCTIONS

/*
 * Setup profiling.  This function may only be called once, subsequent calls are ignored.
 *
 * This must be called before the first call to startProfiling, but doesn't need to be called in the context of a domain.
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

/*
 * Modifies `toInstrument` such that each function has been instrumented for miniprofiler purposes.
 * 
 *
 * Descends recursively, but will terminate even if there are cycles in the object graph.
 *
 * Adds `miniprofiler_instrumented` to `toInstrument`, any contained objects, and any contained functions.
 *
 * Note that to use miniprofiler you *must* be creating a new domain per request, this is necessary for request tracking
 * purposes.
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
 *
 * Note that this call must occur in the context of the domain that will service this request.
 */
function startProfiling(request) {
	if(!configured) throw new Error('configure() must be called before the first call to startProfiling');

	var domain = getDomain('--startProfiling');
	if(!domain) return;

	domain.miniprofiler_currentRequest = request;
	var currentRequestExtension = {};

	currentRequestExtension.startDate = Date.now();
	currentRequestExtension.startTime = process.hrtime();
	currentRequestExtension.stopTime = null;
	currentRequestExtension.stepGraph = makeStep('root', currentRequestExtension.startTime, null);
	currentRequestExtension.id = makeGuid();

	request.miniprofiler_extension = currentRequestExtension;
}

/*
 * Stops profiling the given request.
 *
 * Note that this call must occur in the context of the domain that services this request.
 */
function stopProfiling(){
	var domain = getDomain('--stopProfiling');

	// not profiling
	if(!domain || !domain.miniprofiler_currentRequest) return null;

	var extension = domain.miniprofiler_currentRequest.miniprofiler_extension;

	var time = process.hrtime();

	if(extension.stepGraph.parent != null){
		throw new Error('profiling ended while still in a function, was left in ['+extension.stepGraph.name+']');
	}

	extension.stopTime = time;
	extension.stepGraph.stopTime = time;

	var request = domain.miniprofiler_currentRequest;

	// get those references gone, we can't assume much about GC here
	delete domain.miniprofiler_currentRequest.miniprofiler_extension;
	delete domain.miniprofiler_currentRequest;

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
function step(name, call) {
	var domain = getDomain('--step: '+name);

	// Not profiling
	if(!domain || !domain.miniprofiler_currentRequest) {
		var ret = call();
		return ret;
	}

	var time = process.hrtime();

	var extension = domain.miniprofiler_currentRequest.miniprofiler_extension;

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
		unstep(name, failed);
	}

	return result;
}

function unstep(name, failed) {
	var time = process.hrtime();

	var domain = getDomain('--unstep: '+name);

	// Not profiling
	if(!domain || !domain.miniprofiler_currentRequest) return;

	var extension = domain.miniprofiler_currentRequest.miniprofiler_extension;

	if(extension.stepGraph.name != name){
		throw new Error('profiling stepped out of the wrong function, found ['+name+'] expected ['+extension.stepGraph.name+']');
	}

	extension.stepGraph.stopTime = time;
	if(failed) extension.failed = true;

	// step back up
	extension.stepGraph = extension.stepGraph.parent;
}

function makeGuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
}

function describePerformance(root, request) {
	var ret = {};
	// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	ret.Id = root.id;
	ret.Name = request.url || 'Unknown';
	ret.Started = '/Date('+root.startDate+')/';
	// This doesn't seem to be a thing in node.js
	ret.MachineName = 'Unknown';
	ret.Level = 'Info';
	ret.Root = describeTimings(root.stepGraph, root.stepGraph);
	ret.User = '';
	ret.HasUserViewed = false;
	ret.ClientTimings = null;

	return ret;
}

function diff(start, stop){
	var deltaSecs = stop[0] - start[0];
	var deltaNanoSecs = stop[1] - start[1];

	var elapsedMs = deltaSecs * 1000 + deltaNanoSecs / 1000000;

	return elapsedMs;
}

function describeTimings(timing, root){
	var id = makeGuid();
	var name = timing.name;
	var elapsedMs = diff(timing.startTime, timing.stopTime);
	var sinceRootMs = diff(root.startTime, timing.startTime);

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
		KeyValues: null,
		SqlTimings: null
	};
}

function getDomain(debugName){
	if(this instanceof domain.Domain) {
		return this;
	}

	if(domain.active) return domain.active;

	return null;
}

function makeStep(name, time, parent){
	return { name: name, startTime: time, stopTime: null, parent: parent, steps: [] };
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