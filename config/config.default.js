'use strict';

/**
 * @eggjs/http-proxy default config
 *
 * @member Config#httpProxy
 * @property {Number} timeout - proxy timeout, ms
 * @property {Boolean} withCredentials - whether send cookie when cors
 * @property {Boolean} cache - whether cache proxy
 * @property {Object} cacheOptions - cache options, see https://www.npmjs.com/package/lru-cache
 * @property {Object} ignoreHeaders - ignore request/response headers
 */
exports.httpProxy = {
  timeout: 10 * 1000,

  withCredentials: false,

  cache: false,
  cacheOptions: {
    // only cache GET by default
    calcId(targetUrl, options) {
      if (options.method === 'GET') return targetUrl;
    },
    // cache 1 min by default
    maxAge: 1000 * 60 * 60,
    max: 100,
  },

  charsetHeaders: '_input_charset',

  ignoreHeaders: {
    'strict-transport-security': true,
    'x-powered-by': true,
    'x-readtime': true,
    connection: true,
    date: true,
    'keep-alive': true,
    'proxy-authenticate': true,
    'proxy-authorization': true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
  },
};

exports.customLogger = {
  httpProxyLogger: {
    file: 'http-proxy.log',
  },
};
