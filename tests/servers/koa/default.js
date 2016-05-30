var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var app = koa();
var redis = require('redis');
var pg = require('pg');
var connString = `postgres://docker:docker@${process.env.PG_PORT_5432_TCP_ADDR}/docker`;

var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

app.use(miniprofiler.koa());
app.use(miniprofiler.koa.for(require('../../../lib/providers/miniprofiler.pg.js')(pg)));
app.use(miniprofiler.koa.for(require('../../../lib/providers/miniprofiler.redis.js')(redis)));

app.use(route.get('/', function *(){
  this.body = this.req.miniprofiler.include();
}));

app.use(route.get('/step', function *(){
  this.req.miniprofiler.step('Step', () => {
    this.body = this.req.miniprofiler.include();
  });
}));

app.use(route.get('/step-two', function *(){
  this.req.miniprofiler.step('Step 1', () => {
    this.req.miniprofiler.step('Step 2', () => {
      this.body = this.req.miniprofiler.include();
    });
  });
}));

app.use(route.get('/js-sleep', function *(){
  yield new Promise((resolve, reject) => {
    this.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
      this.body = this.req.miniprofiler.include();
      resolve();
    }, 50);
  });
}));

app.use(route.get('/redis-set-key', function *(){
  yield new Promise((resolve, reject) => {
    client.set('key', 'Awesome!', () => {
      this.body = this.req.miniprofiler.include();
      resolve();
    });
  });
}));

app.use(route.get('/redis-set-get-key', function *(){
  yield new Promise((resolve, reject) => {
    client.set('key', 'Awesome!', () => {
      client.get('key', (err, result) => {
        this.body = this.req.miniprofiler.include();
        resolve();
      });
    });
  });
}));

app.use(route.get('/pg-select', function *(){
  yield new Promise((resolve, reject) => {
    pg.connect(connString, (err, pgClient, done) => {
      pgClient.query('SELECT $1::int AS number', ['1'], (err, result) => {
        this.body = this.req.miniprofiler.include();
        resolve();
      });
    });
  });
}));

module.exports = app;
