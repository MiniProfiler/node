'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
const Hapi = require('hapi');
const vision = require('vision');

const server = new Hapi.Server();
server.connection({ port: 8083 });

server.register(miniprofiler.hapi(), (err) => {
  if (err) throw (err);
});

server.register(vision, (err) => {
  if (err) throw (err);

  server.views({
    engines: { pug: require('pug') },
    path: './tests/servers/views'
  });

  miniprofiler.hapi().vision(server);
});

server.route({
  method: 'GET',
  path:'/',
  handler: function(request, reply) {
    reply.view('index', { title: 'Hey', message: 'Hello there!' });
  }
});

module.exports = server;
