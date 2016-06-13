'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');

const Hapi = require('hapi');

var ip = require('docker-ip');
var redis = require('redis');
var client = redis.createClient(6060, ip());

const server = new Hapi.Server();
server.connection({ port: 8083 });

miniprofiler.configure({
	popupRenderPosition: 'right',
	storage: new miniprofiler.storage.RedisStorage(client)
});

server.register(miniprofiler.hapi(), (err) => {
  if (err) throw (err);
});

server.route({
  method: 'GET',
  path:'/',
  handler: function(request, reply) {
    return reply(request.app.miniprofiler.include());
  }
});

module.exports = server;
