'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const mockServer = require('./fixtures/mock_server');

describe('test/cache.test.js', () => {
  let app;
  let cache;

  before(async () => {
    app = mock.app({
      baseDir: 'apps/cache',
    });
    await app.ready();
    cache = app.httpProxyCache.cache;
  });

  beforeEach(() => mockServer.mock());
  afterEach(() => {
    cache.reset();
    mockServer.restore();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should cache', async () => {
    let res = await app.httpRequest()
      .get('/proxy')
      .query('name=tz')
      .expect(200);

    assert(res.body.path = '/?name=tz');
    assert(!res.headers['x-proxy-cache']);
    assert(cache.has('http://example.com/?name=tz'));
    // not save res
    assert(!cache.get('http://example.com/?name=tz').res);

    res = await app.httpRequest()
      .get('/proxy')
      .query('name=tz')
      .expect(200);

    assert(res.headers['x-proxy-cache']);
    assert(res.body.path = '/?name=tz');
  });

  it('should not cache POST', async () => {
    let res = await app.httpRequest()
      .post('/proxy/json')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .send({ a: 'b' })
      .expect(200);

    assert(res.body.requestBody.a === 'b');
    assert(!res.headers['x-proxy-cache']);
    assert(cache.length === 0);

    mockServer.restore();
    mockServer.mock();

    res = await app.httpRequest()
      .post('/proxy/json')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .send({ a: 'b' })
      .expect(200);

    assert(res.body.requestBody.a === 'b');
    assert(!res.headers[ 'x-proxy-cache' ]);
    assert(cache.length === 0);
  });

  it('should not cache when options.cache = false', async () => {
    const res = await app.httpRequest()
      .get('/proxy/nocache')
      .query('name=tz')
      .expect(200);

    assert(res.body.path = '/?name=tz');
    assert(!res.headers['x-proxy-cache']);

    assert(cache.length === 0);
  });
});
