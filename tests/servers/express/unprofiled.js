'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');

var app = express();

var options = {
  enable: (req) => {
    return false;
  }
};

app.use(miniprofiler.express(options));

app.get('/', (req, res) => {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
    req.miniprofiler.step('Step 1', () => {
      res.send(res.locals.miniprofiler.include());
    });
	}, 50);
});

module.exports = app;
