# node-miniprofiler

Node.js implementation of Stack Exchange's MiniProfiler

### This is working, but not yet considered production ready. Use with caution.

# requirements

Currently requires express and connect to run, because it uses `res.on('header', f)` to trigger storing of data, which is a connect thing.

# usage

Clone this repo into your project's node_modules directory. You can also install from npm, but the package may be outdated: https://www.npmjs.org/package/miniprofiler.

Then see [examples/express/server.js](/blob/master/examples/express/server.js) for example use.

# Want to help?

Things to do:

- remove dependency from express and connect
- storing of client timings on first result postback (there's a todo in the `results` function about where to do this)
- document more things
- better unit test code coverage for everything
- add examples for every web frameworks
- add examples for every provider
- add more providers (mongodb, mysql, redis)
- remove old ids from global storage (when?)
- add eslint to travis
