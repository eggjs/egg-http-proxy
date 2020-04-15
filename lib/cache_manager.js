'use strict';

const assert = require('assert');
const LRU = require('lru-cache');

class HttpProxyCacheManager {
  constructor(app) {
    this.app = app;
    this.config = app.config.httpProxy.cacheOptions;
    assert(this.config.calcId, 'config.httpProxy.cacheOptions.calcId is required to be a function');

    this.cache = new LRU(this.config);
  }

  calcId(targetUrl, options) {
    return this.config.calcId(targetUrl, options);
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, options) {
    value.res = undefined;
    assert(value.data, 'only cache `data`, please use `streaming: false`');
    return this.cache.set(key, value, options.maxAge);
  }
}

module.exports = HttpProxyCacheManager;
