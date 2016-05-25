var http = require('http');
var miniprofiler = require('../lib/miniprofiler.js');

var profiler = miniprofiler.http();

http.createServer(function(req, res) {
  profiler(req, res, () => {
    req.miniprofiler.step('Step 1', function(){
      res.end('home');
    });
  });
}).listen(8080);
