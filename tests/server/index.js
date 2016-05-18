var miniprofiler = require('../../lib/miniprofiler.js');
var express = require('express');
var request = require('request');

var app = express();
var server;

var enableMiniProfiler = (req) => {
  return req.url != '/unprofiled';
};

app.use(miniprofiler.profile(enableMiniProfiler));

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

app.get('/unprofiled', (req, res) => {
	res.send();
});

module.exports = {
  start: () => {
    server = app.listen(8080);
  },
  stop: () => {
    server.close();
  },
  get: (path, cb) => {
    request.get(`http://localhost:8080${path}`, (err, response, body) => {
      cb(err, response, body);
    });
  },
  post: (path, params, cb) => {
    request.post({url: `http://localhost:8080${path}`, form: params }, (err, response, body) => {
      cb(err, response, body);
    });
  }
};
