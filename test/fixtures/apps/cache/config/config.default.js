'use strict';

exports.keys = '123456';

exports.httpProxy = {
  cache: true,
  cacheManager: {
    calcId(targetUrl, options) {
      if (options.method === 'GET') return targetUrl;
    },
    get(key) {
      return this._cache[key];
    },
    set(key, value) {
      value.res = undefined;
      value.data = value.data.toString();
      this._cache[key] = value;
    },
    _cache: {},
  },
};

