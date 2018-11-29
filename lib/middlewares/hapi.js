'use strict';

const asyncContext = require('../async-context');

module.exports = {
  buildMiddleware: function(provider) {
    var plugin = {
      register: (server, options, next) => {
        server.ext('onRequest', function(request, reply) {
          provider.handler(request.raw.req, request.raw.res, () => {
            return reply.continue();
          });
        });
        next();
      }
    };

    plugin.register.attributes = {
      name: `miniprofiler-hapi-${provider.name}`,
      version: require('../../package.json').version
    };

    return plugin;
  },
  mainMiddleware: function(enable, authorize, handleRequest) {
    var plugin = {
      register: (server, options, next) => {
        server.ext('onRequest', function(request, reply) {
          handleRequest(enable, authorize, request.raw.req, request.raw.res).then((handled) => {
            asyncContext.set(request.raw.req.miniprofiler);
            Object.defineProperty(request.app, 'miniprofiler', { get: () => asyncContext.get() });
            Object.defineProperty(request.raw.req, 'miniprofiler', { get: () => asyncContext.get() });

            if (!handled)
              reply.continue();
          });
        });
        next();
      }
    };

    plugin.register.attributes = {
      name: 'miniprofiler-hapi',
      version: require('../../package.json').version
    };

    //That's a bad monkey patch, didn't like it, needs refactor...
    plugin.vision = (server) => {
      var view = server._replier._decorations['view'];

      server._replier._decorations['view'] = function(template, context, options) {
        var viewArguments = arguments;
        this.request.raw.req.miniprofiler.step(`Render: ${template}`, () => {
          return view.apply(this, viewArguments);
        });
      };
    };

    return plugin;
  }
};
