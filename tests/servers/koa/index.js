var server;

module.exports = {
  start: function(name, done) {
    var app = require(`./${name}.js`);
    server = app.listen(8080, done);
  },
  stop: function(done) {
    server.close(done);
  }
};
