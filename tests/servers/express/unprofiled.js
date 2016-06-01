'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');

var app = express();

var disableMiniProfiler = (req) => {
  return false;
};

app.use(miniprofiler.express(disableMiniProfiler));

app.get('/', (req, res) => {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
    req.miniprofiler.step('Step 1', () => {
      res.send(req.miniprofiler.include());
    });
	}, 50);
});

module.exports = app;
