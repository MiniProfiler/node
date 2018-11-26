'use strict';

const asyncHooks = require('async_hooks');

class AsyncContext {
  constructor() {
    this.map = new Map();
    asyncHooks.createHook({
      init: (id, _type, triggerId) => {
        if (this.map.has(triggerId))
          this.map.set(id, this.map.get(triggerId));
      },
      destroy: (id) => this.map.delete(id)
    }).enable();
  }

  get() {
    const id = asyncHooks.executionAsyncId();
    if (this.map.has(id))
      return this.map.get(id);
  }

  set(val) {
    this.map.set(asyncHooks.executionAsyncId(), val);
  }
}

module.exports = new AsyncContext();
