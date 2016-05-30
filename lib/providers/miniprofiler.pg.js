var pgQuery;

module.exports = function(pg) {
  pgQuery = pgQuery || pg.Client.prototype.query;

  return {
    name: 'pg',
    handler: function(req, res, next) {

      pg.Client.prototype.query = !req.miniprofiler.enabled ? pgQuery : function(config, values, callback) {
        req.miniprofiler.timeQuery('sql', config.toString(), pgQuery.bind(this), config, values, callback);
      };

      next();
    }
  };
};