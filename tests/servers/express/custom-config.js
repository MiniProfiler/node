'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');
var ip = require('docker-ip');
var redis = require('redis');
var RedisStorage = require('../../../lib/storages/redis.js');
var client = redis.createClient(6060, ip());

var app = express();

miniprofiler.configure({
	popupRenderPosition: 'right',
	storage: new RedisStorage(client)
});

app.use(miniprofiler.express());

app.get('/', (req, res) => {
	res.send(res.locals.miniprofiler.include());
});

module.exports = app;
