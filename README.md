##### `The project is still under development, the API will change! Use with caution.`

# node-miniprofiler

Node.js implementation of Stack Exchange's MiniProfiler

[![NPM](https://img.shields.io/npm/v/miniprofiler.svg)](https://img.shields.io/npm/v/miniprofiler.svg)
[![Build](https://travis-ci.org/MiniProfiler/node.svg)](https://travis-ci.org/MiniProfiler/node)
[![Coverage](https://coveralls.io/repos/github/MiniProfiler/node/badge.svg?branch=master)](https://coveralls.io/github/MiniProfiler/node?branch=master)
![Dependencies](https://david-dm.org/MiniProfiler/node.svg)
![devDependencies](https://david-dm.org/MiniProfiler/node/dev-status.svg#info=devDependencies)

## Demonstration

Visit [http://miniprofiler-demo.herokuapp.com](http://miniprofiler-demo.herokuapp.com) for a live demonstration.

## Installation (via [npm](https://npmjs.org/package/miniprofiler))

```bash
$ npm install miniprofiler
```

## Usage

### Simple usage using express.js

`server.js`

```javascript
var express = require('express')
  , miniprofiler = require('miniprofiler')
  , app = express();

app.set('view engine', 'pug');
app.use(miniprofiler.express());

app.get('/', function(req, res) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('index');
    });
  });
});

app.listen(8080);
```

`index.pug`

```javascript
doctype html
html
  head
    title MiniProfiler Node.js Example
  body
    h1 Home Page
    | !{miniprofiler.include()}
```

When visiting `localhost:8080`, you should see this.

![](/examples/images/example0.png)

See [goenning/miniprofiler-demo](https://github.com/goenning/miniprofiler-demo) for a running example.

![](/examples/images/example1.png)
![](/examples/images/example2.png)