var miniprofiler = require('../../lib/miniprofiler.js');
var express = require('express');

var app = express();

app.use(miniprofiler.profile());

app.get('/', (req, res) => {
	res.send();
});

app.get('/step', (req, res) => {
  req.miniprofiler.step('Step 1', () => {
    res.send();
  });
});

app.get('/step-two', (req, res) => {
  req.miniprofiler.step('Step 1', () => {
    req.miniprofiler.step('Step 2', () => {
      res.send();
    });
  });
});

module.exports = require('./base.js')(app);
