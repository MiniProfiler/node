var miniprofiler = require('./miniprofiler.js');

var domain = require('domain');
var http = require('http');

var helper = {
	doSomething: function(arg, callback){
		console.log(arg);
		callback();
	}
};

helper = miniprofiler.instrument(helper);

var server = http.createServer(function(request, response) {
	var reqDomain = domain.create();
	reqDomain.add(request);
	reqDomain.add(response);

	request = miniprofiler.instrument(request);
	response = miniprofiler.instrument(response);

	reqDomain.run(function() {
		miniprofiler.startProfiling(request);

		response.writeHead(200, {'Content-Type': 'text/plain'});
	  	response.write('Hello World\n');

	  	miniprofiler.step('testing!', function() {
	  		for(var i = 0; i < 100; i++){
	  			miniprofiler.step('Doit', function() {
	  				console.log('whatever'+i);
	  			});
	  		}
	  	});

	  	helper.doSomething(
	  		'foo',
	  		function(){
	  			console.log('stuff!');
	  		}
	  	);

		response.write('\n');

	  	var profiling = miniprofiler.stopProfiling();

	  	response.end(JSON.stringify(profiling));
  	});
});
server.listen(8080, 'localhost');