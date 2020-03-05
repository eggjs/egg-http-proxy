'use strict';

/**
 * egg-http-proxy default config
 * @member Config#httpProxy
 * @property {Number} timeout - proxy timeout, ms
 * @property {Object} ignoreHeaders - ignore request/response headers
 */
exports.httpProxy = {
  // In unittest, request proxy to self app, make the app server has two http request
  // 1. test request, will close after server response
  // 2. proxy request, use urllib, default use http agent, will keep alive
  // End method in supertest will wait server close callback
  // The server will wait all request close, so test case will be slow
  // So in unit test, not use the http agent
  agent: null,
};
