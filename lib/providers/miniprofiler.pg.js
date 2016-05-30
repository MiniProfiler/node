var pgQuery;

module.exports = function(pg) {
  pgQuery = pgQuery || pg.Client.prototype.query;

  return {
    name: 'pg',
    handler: function(req, res, next) {

      pg.Client.prototype.query = !req.miniprofiler || !req.miniprofiler.enabled ? pgQuery : function(config, values, callback) {
        if (callback) {
          req.miniprofiler.timeQuery('sql', config.toString(), pgQuery.bind(this), config, values, callback);
        } else {
          var timing = req.miniprofiler.startTimeQuery('sql', config.toString());
          var query = pgQuery.call(this, config, values, callback);
          query.on('end', function() {
            req.miniprofiler.stopTimeQuery(timing);
          });
          return query;
        }
      };

      next();
    }
  };
};