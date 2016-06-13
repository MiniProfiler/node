'use strict';

let miniprofilerHashKey = '_miniprofiler_';

function RedisStorage(redisClient, maxAge) {
  this.maxAge = maxAge || 3600;

  this.key = function(id) {
    return `${miniprofilerHashKey}${id}`;
  };

  this.get = function(id, callback) {
    redisClient.get(this.key(id), callback);
  };

  this.set = function(id, json) {
    let key = this.key(id);
    redisClient.set(key, json, (err, data) => {
      redisClient.expire(key, this.maxAge);
    });
  };
}

module.exports = RedisStorage;