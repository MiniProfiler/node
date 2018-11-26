'use strict';

const asyncContext = require('../async-context');

module.exports = {
  buildMiddleware: function(provider) {
    return function(req, res, next) {
      provider.handler(req, res, next);
    };
  },
  mainMiddleware: function(enable, authorize, handleRequest, cls) {
    return function(req, res, next) {
      handleRequest(enable, authorize, req, res).then((handled) => {
        res.locals.miniprofiler = req.miniprofiler;

        asyncContext.set(req.miniprofiler);
        Object.defineProperty(req, 'miniprofiler', { get: () => asyncContext.get() });

        var render = res.render;
        res.render = function() {
          var renderArguments = arguments;
          req.miniprofiler.step(`Render: ${arguments[0]}`, function() {
            render.apply(res, renderArguments);
          });
        };

        if (!handled)
          next();
      }).catch(next);
    };
  }
};
