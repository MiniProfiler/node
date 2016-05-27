'use strict';
var miniprofiler = require('../../../lib/miniprofiler.js');

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

miniprofiler.configure({
	popupRenderPosition: 'right'
});

server.register(miniprofiler.hapi(), (err) => {
  if (err) throw (err);
});

server.route({
  method: 'GET',
  path:'/',
  handler: function(request, reply) {
    return reply(request.raw.req.miniprofiler.include());
  }
});

module.exports = server;
