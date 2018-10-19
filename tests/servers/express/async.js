'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var dummyModule = require('../dummy-module');
var express = require('express');

var app = express();

app.use(miniprofiler.express());
app.use(miniprofiler.express.for(require('../async-provider.js')(dummyModule)));

app.get('/', (req, res) => {
	dummyModule.asyncFn().then(() => {
		Promise.resolve(req.query.once ? undefined : dummyModule.asyncFn())
      .then(() => res.send(res.locals.miniprofiler.include()));
	});
});

module.exports = app;
