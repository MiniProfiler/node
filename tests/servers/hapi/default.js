'use strict';
var miniprofiler = require('../../../lib/miniprofiler.js');
const Hapi = require('hapi');
var redis = require('redis');
var pg = require('pg');
var connString = `postgres://docker:docker@${process.env.PG_PORT_5432_TCP_ADDR}/docker`;

var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

const server = new Hapi.Server();
server.connection({ port: 8083 });

server.register(miniprofiler.hapi(), (err) => {
  if (err) throw err;
});
server.register(miniprofiler.hapi.for.pg(pg), (err) => {
  if (err) throw err;
});
server.register(miniprofiler.hapi.for.redis(redis), (err) => {
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

server.route({
  method: 'GET',
  path:'/redis-set-key',
  handler: function(request, reply) {
    client.set('key', 'Awesome!', () => {
      reply(request.raw.req.miniprofiler.include());
    });
  }
});

server.route({
  method: 'GET',
  path:'/redis-set-get-key',
  handler: function(request, reply) {
    client.set('key', 'Awesome!', () => {
      client.get('key', (err, result) => {
        reply(request.raw.req.miniprofiler.include());
      });
    });
  }
});

server.route({
  method: 'GET',
  path:'/pg-select',
  handler: function(request, reply) {
    pg.connect(connString, function(err, pgClient, done) {
      pgClient.query('SELECT $1::int AS number', ['1'], function(err, result) {
        reply(request.raw.req.miniprofiler.include());
      });
    });
  }
});

module.exports = server;
