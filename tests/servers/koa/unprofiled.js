var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');
var app = koa();

var disableMiniProfiler = (req) => {
  return false;
};

app.use(miniprofiler.koa(disableMiniProfiler));

app.use(route.get('/', function *(){
  this.body = '';
}));

module.exports = app;
