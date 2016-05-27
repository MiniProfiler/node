var miniprofiler = require('../../../lib/miniprofiler.js');
var http = require('http');
var url = require('url');

var disableMiniProfiler = (req) => {
  return false;
};

var profiler = miniprofiler.express(disableMiniProfiler);

var server = http.createServer((req, res) => {

	profiler(req, res, () => {
		var reqPath = url.parse(req.url).pathname;
		if (reqPath == '/') {
      req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
        req.miniprofiler.step('Step 1', () => {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(req.miniprofiler.include());
        });
      }, 50);
		}
	});

});

module.exports = server;
