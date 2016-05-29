var server;

module.exports = {
  start: function(name, port, done) {
    var app = require(`./${name}.js`);
    server = app.listen(port, done);
  },
  stop: function(done) {
    server.close(done);
  }
};
