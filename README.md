# node-miniprofiler

Node.js implementation of Stack Exchange's MiniProfiler

[![Build Status](https://travis-ci.org/goenning/miniprofiler-node.png)](https://travis-ci.org/goenning/miniprofiler-node)
[![Coverage Status](https://coveralls.io/repos/github/goenning/miniprofiler-node/badge.svg?branch=master)](https://coveralls.io/github/goenning/miniprofiler-node?branch=master)
![Dependencies](https://david-dm.org/goenning/miniprofiler-node.svg)
### This is working, but not yet considered production ready. Use with caution.

# requirements

Currently requires express and connect to run, because it uses `res.on('header', f)` to trigger storing of data, which is a connect thing.

# usage

Clone this repo into your project's node_modules directory. You can also install from npm, but the package may be outdated: https://www.npmjs.org/package/miniprofiler.

Then see [examples/express/server.js](/examples/express/server.js) for example use.

![](/examples/example1.png)
![](/examples/example2.png)

# Want to help?

Things to do:

- support major web frameworks like: Express, Hapi, koa.js, Sails.js
- add examples for every web frameworks
- storing of client timings on first result postback (there's a todo in the `results` function about where to do this)
- document more things
- add providers for pg, mongodb, mysql, redis and more
- add coverage badge
- add npm package version badge
- add dependencies status badge
