'use strict';

module.exports = {
  buildMiddleware: function(provider) {
    return function(req, res, next) {
      provider.handler(req, res, next);
    };
  },
  mainMiddleware: function(enable, authorize, handleRequest) {
    return function(req, res, next) {
      handleRequest(enable, authorize, req, res).then((handled) => {
        res.locals.miniprofiler = req.miniprofiler;

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