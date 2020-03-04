'use strict';

const HTTPPROXY = Symbol('context#httpProxy');

module.exports = {
  /**
   * send http proxy request
   *
   * @function Context#curl
   * @param {String|Object} url - request url address.
   * @param {Object} [options] - options for request.
   * @return {Object} see {@link ContextHttpClient#curl}
   */
  async proxyRequest(url, options) {
    /* istanbul ignore else */
    if (!this[HTTPPROXY]) {
      this[HTTPPROXY] = new this.app.HttpProxy(this);
    }
    return this[HTTPPROXY].curl(url, options);
  },
};
