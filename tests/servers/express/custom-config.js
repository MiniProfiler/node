'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var express = require('express');

var app = express();

miniprofiler.configure({
	popupRenderPosition: 'right'
});

app.use(miniprofiler.express());

app.get('/', (req, res) => {
	res.send(req.miniprofiler.include());
});

module.exports = app;
