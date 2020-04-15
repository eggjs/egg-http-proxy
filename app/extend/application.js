
'use strict';

const HttpProxy = require('../../lib/http_proxy');
const CacheManager = require('../../lib/cache_manager');

const INSTANCE = Symbol('Application#httpProxyCache');

module.exports = {
  HttpProxy,
  get httpProxyCache() {
    if (!this[INSTANCE]) {
      this[INSTANCE] = new CacheManager(this);
    }
    return this[INSTANCE];
  },
};
