var onHapiRequest = function(f, handleRequest, request, reply) {
	var enabled = f(request.raw.req, request.raw.res);

	var respondWith = (res, result) => {
		reply(result.body).type(result.type).code(result.status);
	};

	handleRequest(enabled, request.raw.req, request.raw.res, respondWith).then((handled) => {
		if (!handled)
			reply.continue();
	});
};

module.exports = {
  instrument: function(provider, name) {
    var plugin = {
      register: (server, options, next) => {
        server.ext('onRequest', function(request, reply) {
          provider(request.raw.req, request.raw.res, () => {
            return reply.continue();
          });
        });
        next();
      }
    };

    plugin.register.attributes = {
      name: `miniprofiler-hapi-${name}`,
      version: require('../../package.json').version
    };

    return plugin;
  },
  middleware: function(f, handleRequest) {
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