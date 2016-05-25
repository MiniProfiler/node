module.exports = function(f, profiler) {
	if(!f) f = function() { return true; };
	return function(req, res, next) {
		profiler.configure();
		var enabled = f(req, res);

    req.path = require('url').parse(req.url).pathname; //TODO remove this
		if(req.path.startsWith(profiler.resourcePath)) {
			if (!enabled) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.writeHead(404);
        res.end('MiniProfiler is disabled');
        return;
			}

			var sp = req.path.split('/');
			var reqPath = sp[sp.length - 1];

			if(reqPath == 'results')
				profiler.results(req, res, (result) => {
          res.setHeader('Content-Type', result.type);
          res.writeHead(result.status);
          res.end(result.body);
        });
			else
				profiler.static(reqPath, res, (result) => {
          res.setHeader('Content-Type', result.type);
          res.writeHead(result.status);
          res.end(result.body);
        });
			return;
		}
		var id = profiler.startProfiling(req, enabled);

		//res.locals.miniprofiler = enabled ? req.miniprofiler : {
		//	include: function() { return ''; }
		//};

		if (enabled) {
			res.on('finish', function() {
				profiler.stopProfiling(req);
			});
			res.setHeader('X-MiniProfiler-Ids', `["${id}"]`);
		}
		next();
	};
};
