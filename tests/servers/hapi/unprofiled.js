'use strict';
var miniprofiler = require('../../../lib/miniprofiler.js');

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

var disableMiniProfiler = (req) => {
  return false;
};

server.register(miniprofiler.hapi(disableMiniProfiler), (err) => {
  if (err) throw (err);
});

server.route({
  method: 'GET',
  path:'/',
  handler: function(request, reply) {
    return reply('');
  }
});

module.exports = server;
