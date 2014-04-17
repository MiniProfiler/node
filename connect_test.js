var miniprofiler = require('./miniprofiler.js');
var express = require('express');
var connect = require('connect');

// Defaults to 'left'. Uncomment this to move to right. Also supports 'bottomLeft', 'bottomRight'.
/*
miniprofiler.configure({
	popupRenderPosition: 'right'
});
*/

var app = express();
app.use(miniprofiler.profile());

app.get('/', function(req, res) {
	function done() {
		res.send('<html><body>hello' + req.miniprofiler.include() + '</body></html>');
	}
	function query(arg) {
		console.log('arg', arg); // arg == 'some argument'
		setTimeout(done, 234);
	}
	req.miniprofiler.timeQuery('sql', 'SELECT * FROM TEST', query, 'some argument');
});

app.listen(8080);
