'use strict';

const asyncContext = require('../async-context');

module.exports = {
  buildMiddleware: function(provider) {
    return function *(next) {
      yield new Promise((resolve, reject) => {
        provider.handler(this.req, this.res, resolve);
      });
      yield next;
    };
  },
  mainMiddleware: function(enable, authorize, handleRequest) {
    return function *(next) {
      var handled = yield handleRequest(enable, authorize, this.req, this.res);

      asyncContext.set(this.req.miniprofiler);
      Object.defineProperty(this.state, 'miniprofiler', { get: () => asyncContext.get() });
      Object.defineProperty(this.req, 'miniprofiler', { get: () => asyncContext.get() });

      if (this.render) {
        var render = this.render;
        this.render = function() {
          return new Promise((resolve, reject) => {
            var renderArguments = arguments;
            this.req.miniprofiler.step(`Render: ${arguments[0]}`, function() {
              render.apply(this, renderArguments);
              resolve();
            });
          });
        };
      }

      if (!handled)
        yield next;
    };
  }
};
