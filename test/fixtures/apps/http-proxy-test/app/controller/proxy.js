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
        urlObj.pathname = urlObj.pathname.replace(/^\/proxy/, '');
        return urlObj;
      },
      ...opts,
    });
  }

  async index() {
    await this._request();
  }

  async timeout() {
    await this._request({ timeout: 1 });
  }

  async cookie() {
    const { ctx } = this;
    const host = ctx.query.same ? ctx.host : 'example.com';
    const withCredentials = ctx.query.withCredentials;
    await this._request(host, { withCredentials });
  }

  async handler() {
    await this.ctx.proxyRequest('example.com', {
      dataType: 'json',
      streaming: false,
      headers: {
        a: 'c',
      },
      beforeRequest({ headers }) {
        delete headers['test-header'];
      },
      beforeResponse(res) {
        res.data.test = true;
        res.headers.addition = 'true';
        return res;
      },
    });
  }
}

module.exports = ProxyController;
