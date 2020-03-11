'use strict';

const { Controller } = require('egg');

class ProxyController extends Controller {

  async _request(host, opts) {
    const { ctx } = this;
    if (typeof host !== 'string') {
      opts = host;
      host = ctx.host;
    }
    await ctx.proxyRequest(host, {
      rewrite(urlObj) {
        urlObj.pathname = urlObj.pathname.replace(/^\/proxy/, '/real');
        return urlObj;
      },
      ...opts,
    });
  }

  async index() {
    await this._request();
  }

  async json() {
    await this._request();
  }

  async empty() {
    await this._request();
  }

  async plain() {
    await this._request();
  }

  async upload() {
    await this._request();
  }

  async uploadFileMode() {
    await this._request({
      rewrite(urlObj) {
        urlObj.pathname = urlObj.pathname.replace(/^\/proxy\/uploadFileMode/, '/real/upload');
        return urlObj;
      },
    });
  }

  async download() {
    await this._request();
  }

  async header() {
    await this._request();
  }

  async error() {
    await this._request();
  }

  async timeout() {
    await this._request({ timeout: 1 });
  }

  async cookie() {
    const { ctx } = this;
    const host = ctx.query.same ? ctx.host : 'localhost';
    const withCredentials = ctx.query.withCredentials;
    await this._request(host, { withCredentials });
  }

  async handler() {
    await this._request({
      dataType: 'json',
      streaming: false,
      headers: {
        a: 'c',
      },
      rewrite(urlObj) {
        urlObj.pathname = '/real/header';
        return urlObj;
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
