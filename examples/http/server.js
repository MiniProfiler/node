var http = require('http');
var miniprofiler = require('../../lib/miniprofiler.js');

var profile = miniprofiler.profile();

http.createServer(function(req, res) {
  profile(req, res, function() {
    req.miniprofiler.step('Step 1', function(){
      res.end('home');
    });
  });
}).listen(8080);
