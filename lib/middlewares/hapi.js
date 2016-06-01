'use strict';

var onHapiRequest = function(f, handleRequest, request, reply) {
	handleRequest(f, request.raw.req, request.raw.res).then((handled) => {
		if (!handled)
			reply.continue();
	});
};

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
  mainMiddleware: function(f, handleRequest) {
    var plugin = {
      register: (server, options, next) => {
        server.ext('onRequest', onHapiRequest.bind(null, f, handleRequest));
        next();
      }
    };

    plugin.register.attributes = {
      name: 'miniprofiler-hapi',
      version: require('../../package.json').version
    };

    return plugin;
  }
};