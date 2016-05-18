var pgQuery;

module.exports = function(pg) {
	pgQuery = pgQuery || pg.Client.prototype.query;
	return function(req, res, next) {
    if (req.miniprofiler.enabled) {
      pg.Client.query = function(config, values, callback) {
				req.miniprofiler.timeQuery('sql', config.toString(), pgQuery.bind(this), config, values, callback);
			};
		}
		next();
	};
};
