'use strict';

/*
 *  MiniProfiler implementation for node.js.
 *
 *  Apache License, Version 2.0
 *
 *  Kevin Montrose, 2013 @kevin-montrose
 *  Matt Jibson, 2013 @mjibsonF
 *  Guilherme Oenning, 2016 @goenning
 */

 var _ = require('./utils.js');
 var qs = require('querystring');
 var url = require('url');
 var ui = require('./ui.js');
 var clientParser = require('./client-parser.js');
 var ContinuationLocalStorage = require('asyncctx').ContinuationLocalStorage;

 const hostname = require('os').hostname;
var ignoredPaths = [];
 var trivialDurationThresholdMilliseconds = 2.5;
 var popupShowTimeWithChildren = false;
 var popupRenderPosition = 'left';

 exports.storage = {
  InMemoryStorage: require('./storages/inmemory.js'),
  RedisStorage: require('./storages/redis.js')
};

var cls = new ContinuationLocalStorage();
var storage = new exports.storage.InMemoryStorage({ max: 100, maxAge: 1000 * 60 * 60 });

exports.configure = configure;
configure();

for (let framework of ['koa', 'express', 'hapi']) {
  let func = require(`./middlewares/${framework}.js`);

  exports[framework] = function(options) {
    options = options || { };

    if (!options.enable) options.enable = () => { return true; };
    if (!options.authorize) options.authorize = () => { return true; };

    return func.mainMiddleware(options.enable, options.authorize, handleRequest);
  };

  exports[framework].for = func.buildMiddleware;
}

var resourcePath = '/mini-profiler-resources/';
var version = require('../package.json').version;

var contentTypes = {
  css: 'text/css',
  js: 'text/javascript',
  tmpl: 'text/html; charset=utf-8'
};

function getPath(req) {
  return url.parse(req.url).path;
}

function handleRequest(enable, authorize, req, res) {
  return new Promise((resolve, reject) => {
    var enabled = enable(req, res);
    var authorized = authorize(req, res);
    var requestPath = url.parse(req.url).pathname;

    for (let ignoredPath of ignoredPaths) {
      if (requestPath.startsWith(ignoredPath)) {
        enabled = false;
        break;
      }
    }

    if (!requestPath.startsWith(resourcePath)) {
      var extension = startProfiling(req, enabled, authorized);
      if (enabled) {
        res.on('finish', () => {
          stopProfiling(extension, req);
        });
        res.setHeader('X-MiniProfiler-Ids', `["${extension.id}"]`);
      }
      return resolve(false);
    }

    if (!authorized) {
      res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('');
      return resolve(true);
    }

    if (!enabled) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('MiniProfiler is disabled');
      return resolve(true);
    }

    var segments = _.compact(requestPath.split('/'));
    var lastPathSegment = segments[segments.length - 1];
    var handler = (lastPathSegment == 'results') ? results : assets;
    handler(req, res, lastPathSegment, (result) => {
     res.writeHead(result.status, { 'Content-Type': result.type });
     res.end(result.body);
     resolve(true);
   });
  });
}

function assets(req, res, lastPathSegment, done) {
  ui.readFile(lastPathSegment, function(err, data) {
    if (err) {
      done({
        type: 'text/plain; charset=utf-8',
        status: 404,
        body: 'Resource unavailable.'
      });
    } else {
      var rs = lastPathSegment.split('.');
      res.setHeader('Cache-Control', 'public, max-age=31557600');
      done({
        type: contentTypes[rs[rs.length - 1]],
        status: 200,
        body: data
      });
    }
  });
}

function results(req, res, lastPathSegment, done) {
  var proc = function(post, done) {

    var query = url.parse(req.url, true).query;
    var id = post.id || query.id;
    var popup = post.popup || query.popup;
    var timing = (req.method === 'POST') ? clientParser(post) : null;

    storage.get(id, (err, data) => {

      if (!data) {
        done({
          type: 'text/plain; charset=utf-8',
          status:404,
          body: `Id '${id}' not found.`
        });
        return;
      }

      var json = JSON.parse(data);
      if (timing) {
        json.ClientTimings = timing;
        data = JSON.stringify(json);
        storage.set(id, data);
      }

      if (popup == '1') {
        done({
          type: 'application/json',
          status: 200,
          body: data
        });
        return;
      }

      done({
        type: 'text/html; charset=utf-8',
        status: 200,
        body: ui.share({
          name: json.Name,
          duration: json.DurationMilliseconds,
          path: resourcePath,
          json: data,
          includes: include(id),
          version: version
        })
      });
    });
  };

  var body = '';
  req.on('data', function(data) {
    body += data;
  });

  req.on('end', function() {
    var post = qs.parse(body);
    proc(post, done);
  });
}

function include(id) {
  return ui.partial({
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
 *  - storage: InMemoryStorage or RedisStorage; used to store or fetch a string JSON blob of profiling information
 *  - ignoredPaths: string array ; any request whose `url` property is in ignoredPaths will not be profiled
 *  - trivialDurationThresholdMilliseconds: double ; any step lasting longer than this will be considered trivial, and hidden by default
 *  - popupShowTimeWithChildren: boolean ; whether or not to include the "time with children" column
 *  - popupRenderPosition: 'left', 'right', 'bottomLeft', 'bottomRight' ; which side of the screen to display timings on
 */
 function configure(options){
   options = options || {};

   ignoredPaths = options.ignoredPaths || ignoredPaths;
   trivialDurationThresholdMilliseconds = options.trivialDurationThresholdMilliseconds || trivialDurationThresholdMilliseconds;
   popupShowTimeWithChildren = options.popupShowTimeWithChildren || popupShowTimeWithChildren;
   popupRenderPosition = options.popupRenderPosition || popupRenderPosition;
   storage = options.storage || storage;
 }

/*
 * Begins profiling the given request.
 */
 function startProfiling(request, enabled, authorized) {
   var currentRequestExtension = {
    enabled: enabled,
    authorized: authorized
  };

  if (enabled) {
    var path = getPath(request);
    currentRequestExtension.id = _.uuid();
    currentRequestExtension.startDate = Date.now();
    currentRequestExtension.startTime = process.hrtime();
    currentRequestExtension.stopTime = null;
    currentRequestExtension.stepGraph = makeStep(path, currentRequestExtension.startTime, null);
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

  currentRequestExtension.startTimeQuery = function(type, query) {
    return startTimeQuery.call(this, currentRequestExtension, type, query);
  };

  currentRequestExtension.stopTimeQuery = function(timing) {
    return stopTimeQuery.call(this, timing);
  };

  currentRequestExtension.step = function(name, call) {
    if (enabled) {
      step(name, request, call);
    } else {
      call();
    }
  };

  currentRequestExtension.include = function() {
    return enabled && authorized ? include(currentRequestExtension.id) : '';
  };

  cls.setContext(currentRequestExtension);
  Object.defineProperty(request, 'miniprofiler', { get: () => cls.getContext() });

  return currentRequestExtension;
}

/*
 * Stops profiling the given request.
 */
 function stopProfiling(extension, request){
  var time = process.hrtime();

  extension.stopTime = time;
  extension.stepGraph.stopTime = time;

  var json = describePerformance(extension, request);
  storage.set(extension.id, JSON.stringify(json));
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

   var result;
   if (call.length) {
    result = call(() => {
     unstep(name, request);
   });
  } else {
    try {
     result = call();
   } finally {
     unstep(name, request);
   }
 }

 return result;
}

/*
 *  Called to time a query, like to SQL or Redis, that completes with a callback
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
   var timing = startTimeQuery(extension, type, query);
   var params = Array.prototype.slice.call(arguments, 4);

  for(var i = 0; i < params.length; i++){
    if (_.isFunction(params[i])) {
      var param = params[i];
      params[i] = function() {
        extension.stopTimeQuery(timing);
        var ret = param.apply(this, arguments);
        return ret;
      };
    }
  }

  var ret = executeFunction.apply(this, params);
  return ret;
}

function stopTimeQuery(timing) {
  timing.stopTime = process.hrtime();
}

function startTimeQuery(extension, type, query) {
  var time = process.hrtime();
  var startDate = Date.now();

  extension.stepGraph.customTimings[type] = extension.stepGraph.customTimings[type] || [];

  var customTiming = {
    id: _.uuid(),
    executeType: type,
    commandString: _.escape(query),
    startTime: time,
    startDate: startDate,
    callStack: new Error().stack
  };

  extension.stepGraph.customTimings[type].push(customTiming);

  return customTiming;
}

function unstep(name, request) {
  var time = process.hrtime();
  var extension = request.miniprofiler;
  extension.stepGraph.stopTime = time;
  // step back up
  extension.stepGraph = extension.stepGraph.parent;
}

function describePerformance(root, request) {
  var ret = {};

  ret.Id = root.id;
  ret.Name = getPath(request);
  ret.Started = root.startDate;
  ret.MachineName = hostname();
  ret.Root = describeTimings(root.stepGraph, root.stepGraph);
  ret.ClientTimings = null;
  ret.DurationMilliseconds = ret.Root.DurationMilliseconds;

  return ret;
}

function diff(start, stop){
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
  var id = _.uuid();
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
