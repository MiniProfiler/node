var miniprofiler = require('../../../lib/miniprofiler.js');
var http = require('http');
var url = require('url');

miniprofiler.configure({
	popupRenderPosition: 'right'
});

var profiler = miniprofiler.express();

var server = http.createServer((req, res) => {

	profiler(req, res, () => {
		var reqPath = url.parse(req.url).pathname;
		if (reqPath == '/') {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(req.miniprofiler.include());
		}
	});

});

module.exports = server;
