##### `The project is still under development, the API will change! Use with caution. NPM package is currently outdated.`

# node-miniprofiler

Node.js implementation of Stack Exchange's MiniProfiler

[![Build](https://travis-ci.org/MiniProfiler/node.svg)](https://travis-ci.org/MiniProfiler/node)
[![Coverage](https://coveralls.io/repos/github/MiniProfiler/node/badge.svg?branch=master)](https://coveralls.io/github/MiniProfiler/node?branch=master)
![Dependencies](https://david-dm.org/MiniProfiler/node.svg)
![devDependencies](https://david-dm.org/MiniProfiler/node/dev-status.svg#info=devDependencies)

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
app.use(miniprofiler.profile());

app.get('/', function(req, res) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('home');
    });
  });
});

app.listen(8080);
```

`home.pug`

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

See [examples/express.js](/examples/express.js) for more examples.

![](/examples/images/example1.png)
![](/examples/images/example2.png)

# Want to help?

Things to do:

- transform testcases into runnable examples (npm run example)
- storing of client timings on first result postback (there's a todo in the `results` function about where to do this)
- document more things
- add providers for pg, mongodb, mysql, redis and more
