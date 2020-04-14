# @eggjs/http-proxy

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@eggjs/http-proxy.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@eggjs/http-proxy
[travis-image]: https://img.shields.io/travis/eggjs/egg-http-proxy.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-http-proxy
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-http-proxy.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-http-proxy?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-http-proxy.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-http-proxy
[snyk-image]: https://snyk.io/test/npm/@eggjs/http-proxy/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/@eggjs/http-proxy
[download-image]: https://img.shields.io/npm/dm/@eggjs/http-proxy.svg?style=flat-square
[download-url]: https://npmjs.org/package/@eggjs/http-proxy

A simple http proxy base on egg httpclient.

## Install


```bash
$ npm i --save @eggjs/http-proxy
```

```js
// {app_root}/config/plugin.js
exports.httpProxy = {
  enable: true,
  package: '@eggjs/http-proxy',
};
```

## Configuration

```js
// {app_root}/config/config.default.js

/**
 * @property {Number} timeout - proxy timeout, ms
 * @property {Boolean} withCredentials - whether send cookie when cors
 * @property {Boolean} cache - whether cache proxy
 * @property {Object} cacheOptions - cache options, see https://www.npmjs.com/package/lru-cache
 * @property {Object} ignoreHeaders - ignore request/response headers
 */
exports.httpProxy = {};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Usage

```js
/**
 * @param {String} host - target host.
 * @param {Object} [options] - options for request, see https://github.com/node-modules/urllib
 * @param {Boolean} [options.withCredentials] - if true, will send cookie when cors
 * @param {Function} [options.rewrite] - rewrite target url obj
 */
await ctx.proxyRequest(host, options);
```

### target host

```js
// current url: http://eggjs.org/api/user -> http://github.com/api/user
await ctx.proxyRequest('github.com');
```

### rewrite path

```js
// current url: http://eggjs.org/api/user -> http://github.com/egg/eggjs/api/user
await ctx.proxyRequest('github.com', {
  rewrite(urlObj) {
    urlObj.pathname = '/egg/eggjs/api/user';
  },
});
```

### modify response

```js
await ctx.proxyRequest('github.com', {

  streaming: false,

  async beforeResponse(proxyResult) {
    proxyResult.headers.addition = 'true';
    // use streaming=false, then modify `data`,
    // otherwise handler `proxyResult.res` as stream yourself, but don't forgot to adjuest content-length
    proxyResult.data = proxyResult.data.replace('github.com', 'www.github.com');
    return proxyResult;
  },
});
```

### cache

```js
exports.httpProxy = {
  cache: false,
  cacheOptions: {
    // get cache id, if undefined then don't cache the request
    // calcId(targetUrl, options) {
    //   if (options.method === 'GET') return targetUrl;
    // },
    // maxAge: 1000 * 60 * 60,
    // max: 100,
  },
};
```

control cache case by case:

```js
await ctx.proxyRequest('github.com', { cache: true, maxAge: 24 * 60 * 60 * 1000 });
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
