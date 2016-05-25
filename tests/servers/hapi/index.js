var server;
module.exports = {
  start: function(name) {
    server = require(`./${name}.js`);
    server.start((err) => {
      if (err) throw err;
    });
  },
  stop: function() {
    server.stop();
  }
};
