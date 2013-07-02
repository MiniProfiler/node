/*
 *  Miniprofiler implementation for node.js.
 *  
 *  Apache License, Version 2.0
 *
 *  Kevin Montrose, 2013
 */

var domain = require('domain');

// EXPORTS
exports.instrument = addProfiling;
exports.startProfiling = startProfiling;
exports.stopProfiling = stopProfiling;
exports.step = step;

/*
 * Modifies `toInstrument` such that each function has been instrumented for miniprofiler purposes.
 * 
 *
 * Descends recursively, but will terminate even if there are cycles in the object graph.
 *
 * Adds the function `miniprofiler_startProfiling(domain, req)` to `toInstrument` and any contained objects that
 * have functions.  Will throw if that name is already in use.
 *
 * Note that to use miniprofiler you *must* be creating a new domain per request, this is necessary for request tracking
 * purposes.
 */
function addProfiling(toInstrument) {
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
	var domain = getDomain('--startProfiling');
	if(!domain) return;

	domain.miniprofiler_currentRequest = request;
	var currentRequestExtension = {};

	currentRequestExtension.startDate = Date.now();
	currentRequestExtension.startTime = process.hrtime();
	currentRequestExtension.stopTime = null;
	currentRequestExtension.stepGraph = makeStep('root', currentRequestExtension.startTime, null);

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

	return describePerformance(extension, request);
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
	ret.Id = makeGuid();
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

function instrument(func) {
	var name = func.name;

	if(!name) return func;

	var ret = function() {
		var toApply = func;
		var that = this;
		var args = Array.prototype.slice.call(arguments);

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
			var wrappedFunc = instrument(toWrap);

			toInstrument[prop] = wrappedFunc;

			continue;
		}
	}
}