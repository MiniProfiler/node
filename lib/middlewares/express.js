module.exports = function(f, profiler) {
	if(!f) f = function() { return true; };
	return function(req, res, next) {
		profiler.configure();
		var enabled = f(req, res);

		if(req.path.startsWith(profiler.resourcePath)) {
			if (!enabled) {
        res.setHeader('Content-Type', 'text/plain');
        res.writeHead(404);
        res.end('MiniProfiler is disabled.');
        return;
			}

			var sp = req.path.split('/');
			var reqPath = sp[sp.length - 1];
			if(reqPath == 'results')
				profiler.results(req, res);
			else
				profiler.static(reqPath, res);
			return;
		}
		var id = profiler.startProfiling(req, enabled);

		res.locals.miniprofiler = enabled ? req.miniprofiler : {
			include: function() { return ''; }
		};

		if (enabled) {
			res.on('finish', function() {
				profiler.stopProfiling(req);
			});
			res.setHeader('X-MiniProfiler-Ids', `["${id}"]`);
		}
		next();
	};
};
