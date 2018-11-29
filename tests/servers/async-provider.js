'use strict';

module.exports = function(obj) {
  return {
    name: 'dummy-async',
    handler: function(req, res, next) {
      obj.asyncFn = function() {
        const timing = req.miniprofiler.startTimeQuery('async', 'dummy call');

        return new Promise(resolve => {
          setTimeout(() => {
            req.miniprofiler.stopTimeQuery(timing);
            resolve();
          }, 25);
        });
      };

      next();
    }
  };
};
