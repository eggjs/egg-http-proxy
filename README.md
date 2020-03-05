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
$ npm i @eggjs/http-proxy --save
```

```js
// {app_root}/config/plugin.js
exports.httpProxy = {
  enable: true,
  package: '@eggjs/http-proxy',
};
```

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

## Configuration

```js
// {app_root}/config/config.default.js
exports.httpProxy = {

};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
