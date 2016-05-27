module.exports = function(f, handleRequest) {
	return function *(next) {
		var enabled = f(this.req, this.res);

		var respondWith = (res, result) => {
			this.status = result.status;
			this.type = result.type;
			this.body = result.body;
		};

		var handled = yield handleRequest(enabled, this.req, this.res, respondWith);
		if (!handled)
      yield next;
	};
};
