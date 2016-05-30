'use strict';
var miniprofiler = require('../../../lib/miniprofiler.js');
const Hapi = require('hapi');
var redis = require('redis');
var pg = require('pg');
var connString = `postgres://docker:docker@${process.env.PG_PORT_5432_TCP_ADDR}/docker`;

var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

const server = new Hapi.Server();
server.connection({ port: 8083 });

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
    request.raw.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
      request.raw.req.miniprofiler.step('Step 1', () => {
        return reply(request.raw.req.miniprofiler.include());
      });
    }, 50);
  }
});

server.route({
  method: 'GET',
  path:'/pg',
  handler: function(request, reply) {
    pg.connect(connString, function(err, pgClient, done) {
      pgClient.query('SELECT $1::int AS number', ['1'], function(err, result) {
        return reply(request.raw.req.miniprofiler.include());
      });
    });
  }
});

server.route({
  method: 'GET',
  path:'/redis',
  handler: function(request, reply) {
    client.set('key', 'Awesome!', () => {
      return reply(request.raw.req.miniprofiler.include());
    });
  }
});

module.exports = server;
