module.exports = function(f, handleRequest) {
	return function(req, res, next) {
		var enabled = f(req, res);

		var respondWith = (res, result) => {
			res.writeHead(result.status, { 'Content-Type': result.type });
			res.end(result.body);
		};

		handleRequest(enabled, req, res, respondWith).then((handled) => {
			if (!handled)
				next();

		}).catch(next);
	};
};