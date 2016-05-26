var debug = require('debug')('miniprofiler:tests');
var request = require('request');
var frameworks = [ 'koa', 'express', 'hapi', 'http' ];
var all = [ ];

for (var fw of frameworks) {
  var server = require(`./${fw}`);
  server.framework = fw;

  server.get = (path, cb) => {
    request.get(`http://localhost:8080${path}`, (err, response, body) => {
      if (err) debug(err);
      cb(err, response, body);
    });
  };

  server.post = (path, params, cb) => {
    request.post({url: `http://localhost:8080${path}`, form: params }, (err, response, body) => {
      if (err) debug(err);
      cb(err, response, body);
    });
  };

  all.push(server);
}

module.exports = all;
