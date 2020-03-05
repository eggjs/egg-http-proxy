'use strict';

/**
 * egg-http-proxy default config
 *
 * @member Config#httpProxy
 * @property {Number} timeout - proxy timeout, ms
 * @property {Boolean} withCredentials - whether send cookie when cors
 * @property {Object} ignoreHeaders - ignore request/response headers
 */
exports.httpProxy = {
  timeout: 10 * 1000,

  withCredentials: false,

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
    'content-encoding': true,
    upgrade: true,
  },
};

exports.customLogger = {
  httpProxyLogger: {
    file: 'http-proxy.log',
  },
};
