var miniprofiler = require('../../../lib/miniprofiler.js');
const http = require('http');

var profiler = miniprofiler.http();

var server = http.createServer((req, res) => {

	profiler(req, res, () => {
		res.writeHead(200, {'Content-Type': 'text/plain'});

		if (req.path == '/') {
			res.end('');
		} else if (req.path == '/step') {
			req.miniprofiler.step('Step 1', () => {
				res.end('');
			});
		} else if (req.path == '/step-two') {
			req.miniprofiler.step('Step 1', () => {
				req.miniprofiler.step('Step 2', () => {
					res.end('');
				});
			});
		} else if (req.path == '/js-sleep') {
			req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
				res.end('');
			}, 50);
		}
	});

});

module.exports = server;
