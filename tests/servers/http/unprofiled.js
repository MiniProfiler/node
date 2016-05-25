var miniprofiler = require('../../../lib/miniprofiler.js');
const http = require('http');

var disableMiniProfiler = (req) => {
  return false;
};

var profiler = miniprofiler.http(disableMiniProfiler);

var server = http.createServer((req, res) => {

	profiler(req, res, () => {
		if (req.path == '/') {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('');
		}
	});

});

module.exports = server;
