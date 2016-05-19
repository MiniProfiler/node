var pgQuery;

module.exports = function(pg) {
	return function(req, res, next) {
    pgQuery = pgQuery || pg.Client.prototype.query;
    if (req.miniprofiler.enabled) {
      pg.Client.prototype.query = function(config, values, callback) {
				req.miniprofiler.timeQuery('sql', config.toString(), pgQuery.bind(this), config, values, callback);
			};
		}
		next();
	};
};
