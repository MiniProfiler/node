module.exports = function(f, profiler) {
	if(!f) f = function() { return true; };
	return function *(next) {
		profiler.configure();
		var enabled = f(this.req, this.res);

		if (this.path.startsWith(profiler.resourcePath)) {
			if (!enabled) {
        this.type = 'text/plain; charset=utf-8';
        this.status = 404;
        this.body = 'MiniProfiler is disabled';
			} else {
        var sp = this.path.split('/');
        var reqPath = sp[sp.length - 1];
        if (reqPath == 'results') {
          yield new Promise((resolve, reject) => {
            profiler.results(this.req, this.res, (result) => {
              this.type = result.type;
              this.status = result.status;
              this.body = result.body;
              resolve();
            });
          });
        }
        else {
          yield new Promise((resolve, reject) => {
            profiler.static(reqPath, this.res, (result) => {
              this.type = result.type;
              this.status = result.status;
              this.body = result.body;
              resolve();
            });
          });
        }
      }
		} else {
      this.req.path = this.request.path;
      var id = profiler.startProfiling(this.req, enabled);

      if (enabled) {
        var request = this.req;
        this.res.on('finish', function() {
          profiler.stopProfiling(request);
        });
        this.res.setHeader('X-MiniProfiler-Ids', `["${id}"]`);
      }

      yield next;
    }
	};
};
