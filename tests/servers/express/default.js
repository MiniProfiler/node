var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');
var redis = require('redis');
var pg = require('pg');
var connString = `postgres://docker:docker@${process.env.PG_PORT_5432_TCP_ADDR}/docker`;

var app = express();
var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

app.use(miniprofiler.express());
app.use(miniprofiler.express.for.pg(pg));
app.use(miniprofiler.express.for.redis(redis));

app.get('/', (req, res) => {
	res.send(req.miniprofiler.include());
});

app.get('/step', (req, res) => {
  req.miniprofiler.step('Step', () => {
    res.send(req.miniprofiler.include());
  });
});

app.get('/step-two', (req, res) => {
  req.miniprofiler.step('Step 1', () => {
    req.miniprofiler.step('Step 2', () => {
      res.send(req.miniprofiler.include());
    });
  });
});

app.get('/js-sleep', function(req, res) {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
		res.send(req.miniprofiler.include());
	}, 50);
});

app.get('/redis-set-key', function(req, res) {
  client.set('key', 'Awesome!', () => {
		res.send(req.miniprofiler.include());
  });
});

app.get('/redis-set-get-key', function(req, res) {
  client.set('key', 'Awesome!', () => {
    client.get('key', (err, result) => {
      res.send(req.miniprofiler.include());
    });
  });
});

app.get('/pg-select', function(req, res) {
  pg.connect(connString, function(err, pgClient, done) {
    pgClient.query('SELECT $1::int AS number', ['1'], function(err, result) {
      res.send(req.miniprofiler.include());
    });
  });
});

module.exports = app;
