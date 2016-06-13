'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var app = koa();
var ip = require('docker-ip');
var redis = require('redis');

var client = redis.createClient(6060, ip());

miniprofiler.configure({
	popupRenderPosition: 'right',
	storage: new miniprofiler.storage.RedisStorage(client)
});

app.use(miniprofiler.koa());

app.use(route.get('/', function *(){
  this.body = this.state.miniprofiler.include();
}));

module.exports = app;
