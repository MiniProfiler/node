var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var app = koa();

app.use(miniprofiler.koa());

app.use(route.get('/', function *(){
  this.body = this.req.miniprofiler.include();
}));

app.use(route.get('/step', function *(){
  this.req.miniprofiler.step('Step', () => {
    this.body = this.req.miniprofiler.include();
  });
}));

app.use(route.get('/step-error', function *(){
  this.req.miniprofiler.step('Step', () => {
    throw new Error('Ouch!');
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

module.exports = app;
