'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');
var ip = require('docker-ip');
var redis = require('redis');
var client = redis.createClient(6060, ip());

var app = express();

miniprofiler.configure({
	popupRenderPosition: 'right',
	storage: new miniprofiler.storage.RedisStorage(client),
  ignoredPaths: [ '/hidden' ]
});

app.use(miniprofiler.express());

app.get('/', (req, res) => {
	res.send(res.locals.miniprofiler.include());
});

app.get('/hidden', (req, res) => {
  res.send('This won\'t be profiled.');
});

module.exports = app;
