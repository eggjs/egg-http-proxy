'use strict';

const { Controller } = require('egg');

class ProxyController extends Controller {

  async _request(host, opts) {
    const { ctx } = this;
    if (typeof host !== 'string') {
      opts = host;
      host = 'example.com';
    }

    await ctx.proxyRequest(host, {
      rewrite(urlObj) {
        urlObj.port = 80;
        urlObj.pathname = urlObj.pathname.replace(/^\/proxy/, '');
        return urlObj;
      },
      ...opts,
      streaming: false,
    });
  }

  async index() {
    await this._request();
  }
}

module.exports = ProxyController;
