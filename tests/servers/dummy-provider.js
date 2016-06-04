'use strict';

module.exports = function() {
  return {
    name: 'dummy',
    handler: function(req, res, next) {
      next();
    }
  };
};