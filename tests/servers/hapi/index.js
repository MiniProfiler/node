var server;

module.exports = {
  start: function(name, port, done) {
    server = require(`./${name}.js`);
    server.start(done);
  },
  stop: function(done) {
    server.stop({ }, done);
  }
};
