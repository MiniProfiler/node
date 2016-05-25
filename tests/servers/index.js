var request = require('request');
var frameworks = [ 'koa', 'express', 'hapi' ];
var all = [ ];

for (var fw of frameworks) {
  var server = require(`./${fw}`);
  server.framework = fw;

  server.get = (path, cb) => {
    request.get(`http://localhost:8080${path}`, (err, response, body) => {
      cb(err, response, body);
    });
  };

  server.post = (path, params, cb) => {
    request.post({url: `http://localhost:8080${path}`, form: params }, (err, response, body) => {
      cb(err, response, body);
    });
  };

  all.push(server);
}

module.exports = all;
