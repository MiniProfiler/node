'use strict';
var miniprofiler = require('../../../lib/miniprofiler.js');

const Hapi = require('hapi');

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
  path:'/',
  handler: function(request, reply) {
    return reply('');
  }
});

server.route({
  method: 'GET',
  path:'/step',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.step('Step 1', () => {
      return reply('');
    });
  }
});

server.route({
  method: 'GET',
  path:'/step-two',
  handler: function(request, reply) {
  request.raw.req.miniprofiler.step('Step 1', () => {
    request.raw.req.miniprofiler.step('Step 2', () => {
      return reply('');
    });
  });
  }
});

server.route({
  method: 'GET',
  path:'/js-sleep',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
      return reply('');
    }, 50);
  }
});

module.exports = server;
