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

      if (this.render) {
        var render = this.render;
        this.render = function*() {
          var renderArguments = arguments;
          this.req.miniprofiler.step(`Render: ${arguments[0]}`, function() {
            render.apply(this, renderArguments);
          });
        };
      }

      if (!handled)
        yield next;
    };
  }
};
