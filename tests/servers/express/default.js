'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');

var app = express();

app.use(miniprofiler.express());

app.get('/', (req, res) => {
	res.send(res.locals.miniprofiler.include());
});

app.get('/step', (req, res) => {
  req.miniprofiler.step('Step', () => {
    res.send(res.locals.miniprofiler.include());
  });
});

app.get('/step-two', (req, res) => {
  req.miniprofiler.step('Step 1', () => {
    req.miniprofiler.step('Step 2', () => {
      res.send(res.locals.miniprofiler.include());
    });
  });
});

app.get('/step-parallel', (req, res) => {
	var count = 0;
	var finish = () => {
		if (++count == 2)
			res.send(res.locals.miniprofiler.include());
	};

  req.miniprofiler.step('Step 1', finish);
  req.miniprofiler.step('Step 2', finish);
});

app.get('/js-sleep', function(req, res) {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
		res.send(res.locals.miniprofiler.include());
	}, 50);
});

app.get('/js-sleep-start-stop', function(req, res) {
	var timing = req.miniprofiler.startTimeQuery('custom', 'Sleeping...');
	setTimeout(function() {
		req.miniprofiler.stopTimeQuery(timing);
		res.send(res.locals.miniprofiler.include());
	}, 50);
});

module.exports = app;
