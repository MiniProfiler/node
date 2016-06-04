'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 8083 });

server.register(miniprofiler.hapi(), (err) => {
  if (err) throw err;
});

server.register(miniprofiler.hapi.for(require('../dummy-provider.js')()), (err) => {
  if (err) throw err;
});

server.route({
  method: 'GET',
  path:'/',
  handler: function(request, reply) {
    return reply(request.app.miniprofiler.include());
  }
});

server.route({
  method: 'GET',
  path:'/step',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.step('Step', () => {
      return reply(request.app.miniprofiler.include());
    });
  }
});

server.route({
  method: 'GET',
  path:'/step-two',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.step('Step 1', () => {
      request.raw.req.miniprofiler.step('Step 2', () => {
        return reply(request.app.miniprofiler.include());
      });
    });
  }
});

server.route({
  method: 'GET',
  path:'/step-parallel',
  handler: function(request, reply) {
    var count = 0;
    var finish = () => {
    if (++count == 2)
      return reply(request.app.miniprofiler.include());
    };

    request.raw.req.miniprofiler.step('Step 1', finish);
    request.raw.req.miniprofiler.step('Step 2', finish);
  }
});

server.route({
  method: 'GET',
  path:'/js-sleep',
  handler: function(request, reply) {
    request.raw.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
      return reply(request.app.miniprofiler.include());
    }, 50);
  }
});

server.route({
  method: 'GET',
  path:'/js-sleep-start-stop',
  handler: function(request, reply) {
    var timing = request.raw.req.miniprofiler.startTimeQuery('custom', 'Sleeping...');
    setTimeout(function() {
      request.raw.req.miniprofiler.stopTimeQuery(timing);
      return reply(request.app.miniprofiler.include());
    }, 50);
  }
});

module.exports = server;
