var miniprofiler = require('../../../lib/miniprofiler.js');
var http = require('http');
var url = require('url');
var redis = require('redis');

var profiler = miniprofiler.express();
var client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR);

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
		} else if (reqPath == '/redis-set-key') {
      client.set('key', 'Awesome!', () => {
        res.send(req.miniprofiler.include());
      });
		} else if (reqPath == '/redis-set-get-key') {
      client.set('key', 'Awesome!', () => {
        client.get('key', (err, result) => {
          res.send(req.miniprofiler.include());
        });
      });
		}
	});

});

module.exports = server;
