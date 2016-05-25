module.exports = function(f, profiler) {
	if(!f) f = function() { return true; };
	var plugin = {
		register: function(server, options, next) {
			server.ext('onRequest', function(request, reply) {

				profiler.configure();
				var enabled = f(request.raw.req, request.raw.res);

				request.raw.req.path = request.path;
				if(request.path.startsWith(profiler.resourcePath)) {
					if (!enabled) {
						request.raw.res.setHeader('Content-Type', 'text/plain; charset=utf-8');
						request.raw.res.writeHead(404);
						request.raw.res.end('MiniProfiler is disabled');
						return;
					}

					var sp = request.path.split('/');
					var reqPath = sp[sp.length - 1];
					if(reqPath == 'results')
						profiler.results(request.raw.req, request.raw.res, (result) => {
							request.raw.res.setHeader('Content-Type', result.type);
							request.raw.res.writeHead(result.status);
							request.raw.res.end(result.body);
						});
					else
						profiler.static(reqPath, request.raw.res, (result) => {
							request.raw.res.setHeader('Content-Type', result.type);
							request.raw.res.writeHead(result.status);
							request.raw.res.end(result.body);
						});
					return;
				}
				var id = profiler.startProfiling(request.raw.req, enabled);

				//res.locals.miniprofiler = enabled ? req.miniprofiler : {
				//	include: function() { return ''; }
				//};

				if (enabled) {
					request.raw.res.on('finish', function() {
						profiler.stopProfiling(request.raw.req);
					});
					request.raw.res.setHeader('X-MiniProfiler-Ids', `["${id}"]`);
				}

				return reply.continue();

			});
			next();
		}
	};

	plugin.register.attributes = {
    name: 'miniprofiler-hapi',
    version: require('../../package.json').version
	};

	return plugin;
};
