'use strict';

module.exports = {
  buildMiddleware: function(provider) {
    return function *(next) {
      yield new Promise((resolve, reject) => {
        provider.handler(this.req, this.res, resolve);
      });
      yield next;
    };
  },
  mainMiddleware: function(f, handleRequest) {
    return function *(next) {
      var handled = yield handleRequest(f, this.req, this.res);
      this.state.miniprofiler = this.req.miniprofiler;
      if (!handled)
        yield next;
    };
  }
};
