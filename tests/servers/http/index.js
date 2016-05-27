var server;

module.exports = {
  start: function(name, done) {
    server = require(`./${name}.js`);
    server.listen(8080, done);
  },
  stop: function(done) {
    server.close(done);
  }
};
