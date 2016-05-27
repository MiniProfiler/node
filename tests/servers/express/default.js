var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');

var app = express();

app.use(miniprofiler.express());

app.get('/', (req, res) => {
	res.send(req.miniprofiler.include());
});

app.get('/step', (req, res) => {
  req.miniprofiler.step('Step', () => {
    res.send(req.miniprofiler.include());
  });
});

app.get('/step-error', (req, res) => {
  req.miniprofiler.step('Step', () => {
		throw new Error('Ouch!');
  });
});

app.get('/step-two', (req, res) => {
  req.miniprofiler.step('Step 1', () => {
    req.miniprofiler.step('Step 2', () => {
      res.send(req.miniprofiler.include());
    });
  });
});

app.get('/js-sleep', function(req, res) {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
		res.send(req.miniprofiler.include());
	}, 50);
});

module.exports = app;
