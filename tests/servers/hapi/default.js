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
    return reply(request.raw.req.miniprofiler.include());
  }
});

server.route({
  method: 'GET',
  path:'/step',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.step('Step', () => {
      return reply(request.raw.req.miniprofiler.include());
    });
  }
});

server.route({
  method: 'GET',
  path:'/step-error',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.step('Step', () => {
      throw new Error('Ouch!');
    });
  }
});

server.route({
  method: 'GET',
  path:'/step-two',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.step('Step 1', () => {
      request.raw.req.miniprofiler.step('Step 2', () => {
        return reply(request.raw.req.miniprofiler.include());
      });
    });
  }
});

server.route({
  method: 'GET',
  path:'/js-sleep',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
      return reply(request.raw.req.miniprofiler.include());
    }, 50);
  }
});

module.exports = server;
