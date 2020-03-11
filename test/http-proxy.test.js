'use strict';

const path = require('path');
const mock = require('egg-mock');
const assert = require('assert');
const address = require('address');

describe('test/http-proxy.test.js', () => {
  let app;
  before(async () => {
    app = mock.app({
      baseDir: 'apps/http-proxy-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET HTML', async () => {
    const res = await app.httpRequest()
      .get('/proxy')
      .set('x-client', 'unittest')
      .query('name=tz')
      .expect(200);

    assert(res.headers['x-proxy'] === 'true');
    assert(res.headers['x-origin'] === 'real-server');
    assert(res.text === 'hi, egg');
  });

  it('should filter headers', async () => {
    const res = await app.httpRequest()
      .get('/proxy/header')
      .set('x-client', 'unittest')
      .set('X-CASE', 'low')
      .set('x-powered-by', 'client')
      .unexpectHeader('x-powered-by')
      .expect(200);

    assert(!res.body['x-powered-by']);
    assert(res.body['x-forwarded-for'] === address.ip());
    assert(res.body['x-case'] === 'low');
  });

  it('should x-forwarded-for', async () => {
    const res = await app.httpRequest()
      .get('/proxy/header')
      .set('x-client', 'unittest')
      .set('x-forwarded-for', '1.2.3.4')
      .expect(200);

    assert(res.body['x-forwarded-for'] === `1.2.3.4, ${address.ip()}`);
  });

  it('should PUT 204', async () => {
    await app.httpRequest()
      .put('/proxy/empty')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .query('name=tz')
      .send({ a: 'b' })
      .expect(204);
  });

  it('should POST JSON', async () => {
    const res = await app.httpRequest()
      .post('/proxy/json')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .query('name=tz')
      .send({ a: 'b', foo: { bar: true } })
      .expect(200);

    assert(res.headers['x-proxy'] === 'true');
    assert(res.headers['x-origin'] === 'real-server');
    assert(res.body.a === 'b');
    assert(res.body.foo.bar === true);
  });

  it('should POST JSON with form', async () => {
    const res = await app.httpRequest()
      .post('/proxy/json')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .query('name=tz')
      .type('form')
      .send({ a: 'b', foo: { bar: 'foo' } })
      .expect(200);

    assert(res.headers[ 'x-proxy' ] === 'true');
    assert(res.headers[ 'x-origin' ] === 'real-server');
    assert(res.body.a === 'b');
    // nestedQuerystring
    assert(res.body.foo.bar === 'foo');
  });

  it('should POST plain', async () => {
    const res = await app.httpRequest()
      .post('/proxy/plain')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .query('name=tz')
      .send('abc')
      .set('content-type', 'text/plain')
      .expect(200);

    assert(res.headers['x-proxy'] === 'true');
    assert(res.headers['x-origin'] === 'real-server');
    assert(res.text === 'abc');
  });

  describe('upload', () => {
    it('should upload file', async () => {
      const res = await app.httpRequest()
        .post('/proxy/upload')
        .set('x-client', 'unittest')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .query('name=tz')
        .attach('test-content', Buffer.from('test string'), 'abc.txt')
        .attach('test-file', path.join(__dirname, './fixtures/file.txt'), 'test-file.txt')
        .field('a', 'b')
        .expect(200);

      assert(res.headers['x-proxy'] === 'true');
      assert(res.headers['x-origin'] === 'real-server');
      assert(res.body.fields.a === 'b');
      assert(res.body.files[0].field === 'test-content');
      assert(res.body.files[0].filename === 'abc.txt');
      assert(res.body.files[0].content === 'test string');
      assert(res.body.files[1].field === 'test-file');
      assert(res.body.files[1].filename === 'test-file.txt');
      assert(res.body.files[1].content === 'this is a test file\n');
    });

    it('should upload file only field', async () => {
      const res = await app.httpRequest()
        .post('/proxy/upload')
        .set('x-client', 'unittest')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .query('name=tz')
        .field('a', 'b')
        .expect(200);

      assert(res.headers['x-proxy'] === 'true');
      assert(res.headers['x-origin'] === 'real-server');
      assert(res.body.fields.a === 'b');
    });

    it('should upload file with file mode', async () => {
      const res = await app.httpRequest()
        .post('/proxy/uploadFileMode')
        .set('x-client', 'unittest')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .query('name=tz')
        .attach('test-content', Buffer.from('test string'), 'abc.txt')
        .attach('test-file', path.join(__dirname, './fixtures/file.txt'), 'test-file.txt')
        .field('a', 'b')
        .expect(200);

      assert(res.headers['x-proxy'] === 'true');
      assert(res.headers['x-origin'] === 'real-server');
      assert(res.body.fields.a === 'b');
      assert(res.body.files[0].field === 'test-content');
      assert(res.body.files[0].filename === 'abc.txt');
      assert(res.body.files[0].content === 'test string');
      assert(res.body.files[1].field === 'test-file');
      assert(res.body.files[1].filename === 'test-file.txt');
      assert(res.body.files[1].content === 'this is a test file\n');
    });

    it('should upload file with charset', async () => {
      const res = await app.httpRequest()
        .post('/proxy/upload')
        .set('x-client', 'unittest')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .query('_input_charset=utf-8')
        .attach('test-file', path.join(__dirname, './fixtures/file.txt'), 'test-file.txt')
        .field('a', 'this is 中文')
        .expect(200);

      assert(res.body.fields.a === 'this is 中文');
      assert(res.body.files[0].content === 'this is a test file\n');
      assert(res.body.headers['content-type'].includes('charset=utf-8'));
    });
  });

  it('should download', async () => {
    const res = await app.httpRequest()
      .post('/proxy/download')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect(200);

    assert(res.headers['content-type'] === 'application/octet-stream');
    assert(res.headers['content-disposition'] === 'attachment; filename="test-file.txt"');
    assert(res.body.toString() === 'this is a test file\n');
  });

  it('should error', async () => {
    const res = await app.httpRequest()
      .get('/proxy/error')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect(500);

    assert(res.text === 'some error');
  });

  it('should timeout', async () => {
    await app.httpRequest()
      .get('/proxy/timeout')
      .set('x-client', 'unittest')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect(500);
  });

  describe('cookie', () => {
    it('should not send cookie when withCredentials = false && sameSite = false', async () => {
      await app.httpRequest()
        .get('/proxy/cookie')
        .set('x-client', 'unittest')
        .set('cookie', 'a=b')
        .expect(204);
    });

    it('should send cookie when withCredentials = true && sameSite = false', async () => {
      await app.httpRequest()
        .get('/proxy/cookie')
        .query('withCredentials=true')
        .set('x-client', 'unittest')
        .set('cookie', 'a=b')
        .expect('b')
        .expect(200);
    });

    it('should send cookie when withCredentials = false && sameSite = true', async () => {
      await app.httpRequest()
        .get('/proxy/cookie')
        .query('same=true')
        .set('x-client', 'unittest')
        .set('cookie', 'a=b')
        .expect('b')
        .expect(200);
    });

    it('should send cookie when withCredentials = true && sameSite = true', async () => {
      await app.httpRequest()
        .get('/proxy/cookie')
        .query('same=true')
        .query('withCredentials=true')
        .set('x-client', 'unittest')
        .set('cookie', 'a=b')
        .expect('b')
        .expect(200);
    });
  });


  it('should jump out of egg middleware', async () => {
    await app.httpRequest()
      .get('/proxy/header')
      .set('x-client', 'unittest')
      .unexpectHeader('post-middleware')
      .expect(200);
  });

  it('custom handler', async () => {
    const res = await app.httpRequest()
      .get('/proxy/handler')
      .set('x-client', 'unittest')
      .set('test-header', 'true')
      .expect(200);

    assert(res.body.test === true);
    assert(res.body.a === 'c');
    assert(!res.body['test-header']);
    assert(res.headers.addition === 'true');
    assert(res.headers['post-middleware'] === 'true');
  });
});
