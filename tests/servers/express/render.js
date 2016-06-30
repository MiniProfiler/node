'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');

var app = express();

app.use(miniprofiler.express());
app.set('view engine', 'pug');
app.set('views', './tests/servers/views');

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});

app.get('/inside-step', (req, res) => {
  req.miniprofiler.step('Step 1', (unstep) => {
    req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
      res.render('index', { title: 'Hey', message: 'Hello there!' });
      unstep();
    }, 50);
  });
});

module.exports = app;
