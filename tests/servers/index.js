'use strict';

var debug = require('debug')('miniprofiler:tests');
var request = require('request');
var frameworks = {
  'koa': { 'port': 8081 },
  'express': { 'port': 8082 },
  'hapi': { 'port': 8083 }
};

var all = [ ];

for (let fw in frameworks) {
  var server = require(`./${fw}`);
  server.framework = fw;
  frameworks[fw].server = server;

  server.setUp = function(name, done) {
    Object.keys(require.cache).forEach((key) => { delete require.cache[key]; });
    frameworks[fw].server.start(name, frameworks[fw].port, done);
  };

  server.tearDown = function(done) {
    frameworks[fw].server.stop(done);
  };

  server.get = (path, cb) => {
    request.get(`http://localhost:${frameworks[fw].port}${path}`, (err, response, body) => {
      if (err) debug(err);
      cb(err, response, body);
    });
  };

  server.post = (path, params, cb) => {
    request.post({url: `http://localhost:${frameworks[fw].port}${path}`, form: params }, (err, response, body) => {
      if (err) debug(err);
      cb(err, response, body);
    });
  };

  all.push(server);
}

module.exports = all;
