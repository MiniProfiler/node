'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var dummyModule = require('../dummy-module');
var koa = require('koa');
var route = require('koa-route');
var app = koa();

app.use(miniprofiler.koa());
app.use(miniprofiler.koa.for(require('../async-provider.js')(dummyModule)));

app.use(route.get('/', function *(){
  yield dummyModule.asyncFn().then(() => {
    return Promise.resolve(this.query.once ? undefined : dummyModule.asyncFn())
      .then(() => { this.body = this.state.miniprofiler.include(); });
  });
}));

module.exports = app;
