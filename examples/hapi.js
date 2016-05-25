'use strict';
var miniprofiler = require('../lib/miniprofiler.js');

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8080
});

server.register(miniprofiler.hapi(), (err) => {
  if (err) throw err;
});

server.route({
  method: 'GET',
  path:'/hello',
  handler: function(request, reply) {
    return reply('<html><body>hello' + request.raw.req.miniprofiler.include() + '</body></html>');
  }
});

server.start((err) => {
  if (err) throw err;
});
