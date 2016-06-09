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

module.exports = app;
