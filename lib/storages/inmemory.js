'use strict';

var LRU = require('lru-cache');
let miniprofilerHashKey = '_miniprofiler_';

function InMemoryStorage(options) {
  this.key = function(id) {
    return `${miniprofilerHashKey}${id}`;
  };

  this.cache = LRU(options);

  this.get = function(id, callback) {
    var data = this.cache.get(this.key(id));
    if (data)
      callback(null, data);
    else
      callback(new Error(`Id '${id}' not found.`));
  };

  this.set = function(id, json) {
    this.cache.set(this.key(id), json);
  };
}

module.exports = InMemoryStorage;