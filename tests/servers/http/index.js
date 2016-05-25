var server;
module.exports = {
  start: function(name) {
    server = require(`./${name}.js`);
    server.listen(8080);
  },
  stop: function() {
    server.close();
  }
};
