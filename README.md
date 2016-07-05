# MiniProfiler for Node.js

Node.js implementation of Stack Exchange's MiniProfiler

[![NPM](https://img.shields.io/npm/v/miniprofiler.svg)](https://www.npmjs.com/package/miniprofiler)
[![Build](https://travis-ci.org/MiniProfiler/node.svg?branch=master)](https://travis-ci.org/MiniProfiler/node)
[![Coverage](https://coveralls.io/repos/github/MiniProfiler/node/badge.svg?branch=master)](https://coveralls.io/github/MiniProfiler/node?branch=master)
![Dependencies](https://david-dm.org/MiniProfiler/node.svg)
![devDependencies](https://david-dm.org/MiniProfiler/node/dev-status.svg#info=devDependencies)

## Demonstration

Visit [http://miniprofiler-demo.herokuapp.com](http://miniprofiler-demo.herokuapp.com) for a live demonstration.

## Installation

```bash
$ npm install miniprofiler
```

You can hook up your application with any of the following packages are available on npm:

| Name      | About     | Version   |
|-----------|-----------|-----------|
| `miniprofiler-http` | Profile http(s) requests | [![NPM](https://img.shields.io/npm/v/miniprofiler-http.svg)](https://www.npmjs.com/package/miniprofiler-http) |
| `miniprofiler-pg` | Profile [pg](https://www.npmjs.com/package/pg) queries | [![NPM](https://img.shields.io/npm/v/miniprofiler-pg.svg)](https://www.npmjs.com/package/miniprofiler-pg) |
| `miniprofiler-redis`| Profile [redis](https://www.npmjs.com/package/redis) calls | [![NPM](https://img.shields.io/npm/v/miniprofiler-redis.svg)](https://www.npmjs.com/package/miniprofiler-redis) |

## Usage

### Simple usage with express.js

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

## API

### `miniprofiler.{framework}([options])`

Replace `{framework}` with koa, express or hapi.

This function returns a framework specific middleware that is responsible for initializing MiniProfiler on each request.

#### `options` object properties
| Property  | Default   | Description |
|-----------|-----------|-------------|
| enable    | Always returns true | function(req, res) => boolean; this function is used to determine if the profiler should be enabled for the current request |
| authorize | Always returns true | function(req, res) => boolean; this function is used to determine if the current request should be able to see the profiling results |

### `miniprofiler.{framework}.for([provider])`

`provider` is a call for any of the supported providers listed [here](#installation).

### `miniprofiler.configure([options])`

#### `options` object properties
| Property  | Default   | Description |
|-----------|-----------|-------------|
| storage   | InMemoryStorage({ max: 100, maxAge: 1000 \* 60 \* 60 }) | InMemoryStorage or RedisStorage; used to store or fetch a string JSON blob of profiling information |
| ignoredPaths | [ ] | string array ; any request whose `url` property is in ignoredPaths will not be profiled |
| trivialDurationThresholdMilliseconds | 2.5 | double ; any step lasting longer than this will be considered trivial, and hidden by default |
| popupShowTimeWithChildren | false | boolean ; whether or not to include the "time with children" column |
| popupRenderPosition       | left  | 'left', 'right', 'bottomLeft' or 'bottomRight' ; which side of the screen to display timings on |

#### `options.storage` examples

#### InMemoryStorage

```
miniprofiler.configure({
  storage: miniprofiler.storage.InMemoryStorage({ lruCacheOptions });
})
```

Refer to [lru-cache](https://www.npmjs.com/package/lru-cache) documentation for `lruCacheOptions`.

#### RedisStorage

```
miniprofiler.configure({
  storage: miniprofiler.storage.RedisStorage(client);
})
```

Where `client` is an instance of [redis.createClient](https://www.npmjs.com/package/redis).
