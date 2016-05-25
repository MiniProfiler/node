var server;
module.exports = {
  start: function(name) {
    var app = require(`./${name}.js`);
    server = app.listen(8080);
  },
  stop: function() {
    server.close();
  }
}
