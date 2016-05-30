var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');
var redis = require('redis');
var pg = require('pg');
var connString = `postgres://docker:docker@${process.env.PG_PORT_5432_TCP_ADDR}/docker`;

var app = express();
var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

var disableMiniProfiler = (req) => {
  return false;
};

app.use(miniprofiler.express(disableMiniProfiler));

app.get('/', (req, res) => {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
    req.miniprofiler.step('Step 1', () => {
      res.send(req.miniprofiler.include());
    });
	}, 50);
});

app.get('/pg', (req, res) => {
  pg.connect(connString, function(err, pgClient, done) {
    pgClient.query('SELECT $1::int AS number', ['1'], function(err, result) {
      res.send(req.miniprofiler.include());
    });
  });
});

app.get('/redis', (req, res) => {
  client.set('key', 'Awesome!', () => {
		res.send(req.miniprofiler.include());
  });
});

module.exports = app;
