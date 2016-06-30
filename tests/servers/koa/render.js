'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var views = require('koa-views');
var app = koa();

app.use(views('./tests/servers/views', { extension: 'pug' }));

app.use(miniprofiler.koa());

app.use(route.get('/', function *(){
  yield this.render('index', { title: 'Hey', message: 'Hello there!' });
}));

app.use(route.get('/inside-step', function *(){
  yield new Promise((resolve, reject) => {
    this.req.miniprofiler.step('Step 1', (unstep) => {
      this.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
        this.render('index', { title: 'Hey', message: 'Hello there!' }).then(() => {
          unstep();
          resolve();
        });
      }, 50);
    });
  });
}));

module.exports = app;
