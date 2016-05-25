module.exports = function(f, profiler) {
	if(!f) f = function() { return true; };
	return function *(next) {
		profiler.configure();
		var enabled = f(this.req, this.res);

		if (this.path.startsWith(profiler.resourcePath)) {
			if (!enabled) {
        this.type = 'text';
        this.status = 404;
        this.body = 'MiniProfiler is disabled';
        return;
			}

			var sp = this.path.split('/');
			var reqPath = sp[sp.length - 1];
			if(reqPath == 'results')
				profiler.results(this.req, this.res);
			else
				profiler.static(reqPath, this.res);
			return;
		}
		var id = profiler.startProfiling(this.req, enabled);

		if (enabled) {
      var request = this.req;
			this.res.on('finish', function() {
				profiler.stopProfiling(request);
			});
			this.res.setHeader('X-MiniProfiler-Ids', `["${id}"]`);
		}

    yield next;
	};
};
