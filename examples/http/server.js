var http = require('http');
var miniprofiler = require('../../miniprofiler.js');

http.createServer(function (req, res) {
  var profile = miniprofiler.profile();
  profile(req, res, function(){
    req.miniprofiler.step('a', function(){
  	   res.end('home');
    })
  })
}).listen(8080);
