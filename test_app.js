var miniprofiler = require('./miniprofiler.js');

var domain = require('domain');
var http = require('http');

http = miniprofiler.addProfiling(http);

var server = http.createServer(function(request, response) {
	var reqDomain = domain.create();
	reqDomain.add(request);
	reqDomain.add(response);

	reqDomain.run(function() {
		response.writeHead(200, {'Content-Type': 'text/plain'});
	  	response.end('Hello World\n');
  	});
});
server.listen(8080, 'localhost');