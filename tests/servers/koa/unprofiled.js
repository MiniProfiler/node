var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var redis = require('redis');
var pg = require('pg');
var connString = `postgres://docker:docker@${process.env.PG_PORT_5432_TCP_ADDR}/docker`;

var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

var app = koa();

var disableMiniProfiler = (req) => {
  return false;
};

app.use(miniprofiler.koa(disableMiniProfiler));

app.use(route.get('/', function *(){
  yield new Promise((resolve, reject) => {
    this.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
      this.req.miniprofiler.step('Step 1', () => {
        this.body = this.req.miniprofiler.include();
        resolve();
      });
    }, 50);
  });
}));

app.use(route.get('/pg', function *(){
  yield new Promise((resolve, reject) => {
    pg.connect(connString, (err, pgClient, done) => {
      pgClient.query('SELECT $1::int AS number', ['1'], (err, result) => {
        this.body = this.req.miniprofiler.include();
        resolve();
      });
    });
  });
}));

app.use(route.get('/redis', function *(){
  yield new Promise((resolve, reject) => {
    client.set('key', 'Awesome!', () => {
      this.body = this.req.miniprofiler.include();
      resolve();
    });
  });
}));

module.exports = app;
