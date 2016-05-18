var request = require('request');

module.exports = function(app) {
  var server;
  return {
    start: () => {
      server = app.listen(8080);
    },
    stop: () => {
      server.close();
    },
    get: (path, cb) => {
      request.get(`http://localhost:8080${path}`, (err, response, body) => {
        cb(err, response, body);
      });
    },
    post: (path, params, cb) => {
      request.post({url: `http://localhost:8080${path}`, form: params }, (err, response, body) => {
        cb(err, response, body);
      });
    }
  };

};
