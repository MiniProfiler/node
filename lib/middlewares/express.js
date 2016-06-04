'use strict';

module.exports = {
  buildMiddleware: function(provider) {
    return function(req, res, next) {
      provider.handler(req, res, next);
    };
  },
  mainMiddleware: function(f, handleRequest) {
    return function(req, res, next) {
      handleRequest(f, req, res).then((handled) => {
        res.locals.miniprofiler = req.miniprofiler;

        if (!handled)
          next();
      }).catch(next);
    };
  }
};