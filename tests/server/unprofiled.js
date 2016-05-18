var miniprofiler = require('../../lib/miniprofiler.js');
var express = require('express');

var app = express();

var disableMiniProfiler = (req) => {
  return false;
};

app.use(miniprofiler.profile(disableMiniProfiler));

app.get('/', (req, res) => {
	res.send();
});

module.exports = require('./base.js')(app);
