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

module.exports = app;
