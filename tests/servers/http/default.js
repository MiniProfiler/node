var miniprofiler = require('../../../lib/miniprofiler.js');
var http = require('http');
var url = require('url');

var profiler = miniprofiler.express();

var server = http.createServer((req, res) => {

	profiler(req, res, () => {
		var reqPath = url.parse(req.url).pathname;
		res.writeHead(200, {'Content-Type': 'text/plain'});

		if (reqPath == '/') {
			res.end(req.miniprofiler.include());
		} else if (reqPath == '/step') {
			req.miniprofiler.step('Step', () => {
				res.end(req.miniprofiler.include());
			});
		} else if (reqPath == '/step-error') {
			req.miniprofiler.step('Step', () => {
				throw new Error('Ouch!');
			});
		}  else if (reqPath == '/step-two') {
			req.miniprofiler.step('Step 1', () => {
				req.miniprofiler.step('Step 2', () => {
					res.end(req.miniprofiler.include());
				});
			});
		} else if (reqPath == '/js-sleep') {
			req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
				res.end(req.miniprofiler.include());
			}, 50);
		}
	});

});

module.exports = server;
