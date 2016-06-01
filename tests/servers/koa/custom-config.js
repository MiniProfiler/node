'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var app = koa();

miniprofiler.configure({
	popupRenderPosition: 'right'
});

app.use(miniprofiler.koa());

app.use(route.get('/', function *(){
  this.body = this.req.miniprofiler.include();
}));

module.exports = app;
