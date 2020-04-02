'use strict';

const { URL } = require('url');
const FormStream = require('formstream');
const ContentType = require('content-type');
const address = require('address');
const assert = require('assert');

class HttpProxy {
  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = this.app.config.httpProxy;
    this.logger = this.ctx.getLogger('httpProxyLogger');
    this.ip = address.ip();
  }

  /**
   * send http proxy base on {@link HttpClient}.
   *
   * @param {String} host - target host.
   * @param {Object} [options] - options for request.
   * @param {Boolean} [options.withCredentials] - if true, will send cookie when cors
   * @param {Function} [options.rewrite] - rewrite target url obj
   */
  async curl(host, options) {
    const { ctx } = this;

    const defaultOptions = {
      timeout: this.config.timeout,
      agent: this.config.agent,
      streaming: true,
      followRedirect: false,
      beforeResponse: undefined,
    };

    options = {
      method: ctx.method,
      ...defaultOptions,
      ...options,
    };

    if (options.withCredentials === undefined) options.withCredentials = this.config.withCredentials;

    let urlObj = new URL(ctx.href);
    urlObj.host = host;

    if (options.rewrite) {
      urlObj = options.rewrite(urlObj);
      assert(urlObj, 'options.rewrite must return urlObj');
    }

    // filter header
    const reqHeaders = {};
    for (const key of Object.keys(ctx.header)) {
      if (this.config.ignoreHeaders[key]) continue;
      reqHeaders[key.toLowerCase()] = ctx.header[key];
    }
    // X-Forwarded-For
    const forwarded = ctx.get('x-forwarded-for');
    reqHeaders['x-forwarded-for'] = forwarded ? `${forwarded}, ${this.ip}` : this.ip;

    options.headers = {
      ...reqHeaders,
      ...options.headers || {},
      host: urlObj.host,
    };

    // don't send cookie when cors without withCredentials
    if (urlObj.host !== ctx.host && !options.withCredentials) {
      delete options.headers.cookie;
    }

    if (ctx.method === 'POST' || ctx.method === 'PUT') {
      const { rawBody, body: requestBody, files } = ctx.request;
      // file upload
      if (ctx.is('multipart') || ctx.is('application/octet-stream')) {
        // file mode -> restore to formstream
        if (files) {
          const form = new FormStream();

          for (const fieldName of Object.keys(requestBody)) {
            form.field(fieldName, requestBody[fieldName]);
          }

          for (const file of files) {
            form.file(file.fieldname, file.filepath, file.filename);
          }

          const formHeaders = form.headers();
          for (const key of Object.keys(formHeaders)) {
            options.headers[key.toLowerCase()] = formHeaders[key];
          }

          options.stream = form;
        } else {
          // stream mode
          options.stream = ctx.req;
        }

        // charset compatibility, some Java will use `GBK` to decode field
        const contentTypeStr = ctx.get('content-type');
        /* istanbul ignore else */
        if (contentTypeStr) {
          const contentType = ContentType.parse(contentTypeStr);
          const inputCharset = ctx.query[this.config.charsetHeaders];
          if (!contentType.parameters.charset && inputCharset) {
            contentType.parameters.charset = inputCharset;
            options.headers['content-type'] = ContentType.format(contentType);
          }
        }
      } else if (requestBody && rawBody) {
        // bodyParser(json: application/json, form: application/x-www-form-urlencoded)
        // urllib default use querystring to stringify form data which don't support nested object
        // will use qs instead of querystring to support nested object by set nestedQuerystring to true.
        options.nestedQuerystring = true;
        options.data = requestBody;
        // urllib wll auto set
        delete options.headers['content-length'];
      } else {
        // recommended: if you use `proxyRequest()` at middleware and before `bodyParser` and `multipart` then it will run this.
        options.stream = ctx.req;
      }
    }

    // send request
    const targetUrl = urlObj.toString();
    let proxyResult;
    try {
      proxyResult = await ctx.curl(targetUrl, options);
      this.logger.info(`forward:success, status:${proxyResult.status}, targetUrl:${targetUrl}`);
    } catch (err) {
      this.logger.warn(`forward:fail, status:${err.status}, targetUrl:${targetUrl}`);
      throw err;
    }

    if (options.beforeResponse) proxyResult = await options.beforeResponse(proxyResult);
    const { headers, status, data, res } = proxyResult;

    for (const key of Object.keys(headers)) {
      if (this.config.ignoreHeaders[key]) continue;
      ctx.set(key, headers[key]);
    }

    ctx.status = status;

    // avoid egg middleware post-handler to override headers, such as x-frame-options
    if (data) {
      let body = data;
      if (!Buffer.isBuffer(body) && typeof body !== 'string') {
        // body: json
        body = JSON.stringify(body);
        ctx.length = Buffer.byteLength(body);
      }
      ctx.respond = false;
      ctx.res.flushHeaders();
      ctx.res.end(body);
    } else {
      ctx.respond = false;
      ctx.res.flushHeaders();
      res.pipe(ctx.res);
    }
  }
}

module.exports = HttpProxy;
