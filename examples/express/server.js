var miniprofiler = require('../../miniprofiler.js');
var pg = require('pg');
var miniprofilerPG = function(pg) {
	return function (req, res, next) {
		if (req.miniprofiler.enabled) {
			var pgQuery = pg.Client.prototype.query
			pg.Client.prototype.query = function(config, values, callback) {
				req.miniprofiler.timeQuery('sql', 'SELECT $1::int AS number', pgQuery.bind(this), config, values, callback);
				pg.Client.prototype.query = pgQuery
			}
		}
		next()
	}
}

var express = require('express');
var connString = "postgres://postgres:postgres@localhost/async_demo";

// Defaults to 'left'. Uncomment this to move to right. Also supports 'bottomLeft', 'bottomRight'.
/*
miniprofiler.configure({
	popupRenderPosition: 'right'
});
*/

var app = express();
app.use(miniprofiler.profile());
app.use(miniprofilerPG(pg));

app.set('view engine', 'pug');
app.set('views', './examples/views')

app.get('/', function(req, res) {
	pg.connect(connString, function(err, client, done) {
		client.query('SELECT $1::int AS number', ['1'], function(err, result) {
	    done();
			res.render('home');
	  });
	});
});

app.get('/multi-query', function(req, res) {
	req.miniprofiler.step('Step 1', function() {
		req.miniprofiler.step('Step 2', function() {
			req.miniprofiler.timeQuery('sql', 'SELECT * FROM TEST', function() {
				req.miniprofiler.timeQuery('sql', 'SELECT * FROM TEST', function() {
		  		res.render('multi-query');
				});
			});
		});
	});
});

app.listen(8080);
