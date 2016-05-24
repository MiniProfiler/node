var koa = require('koa');
var app = koa();
var miniprofiler = require('../lib/miniprofiler.js')

app.use(miniprofiler.koa(() => {return false;}));

app.use(function *(){
  this.body = '<html><body>hello' + this.req.miniprofiler.include() + '</body></html>';
});

app.listen(8080);
