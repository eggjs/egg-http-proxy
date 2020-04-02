'use strict';

const path = require('path');
const mock = require('egg-mock');
const assert = require('assert');
const address = require('address');
const mockServer = require('./fixtures/mock_server');

describe('test/http-proxy.test.js', () => {
  let app;

  before(async () => {
    app = mock.app({
      baseDir: 'apps/http-proxy-test',
    });
    return app.ready();
  });

  beforeEach(() => mockServer.mock());
  afterEach(() => mockServer.restore());

  after(() => app.close());
  afterEach(mock.restore);

  it('should work', async () => {
    const res = await app.httpRequest()
      .get('/proxy')
      .set('x-client', 'unittest')
      .set('X-CASE', 'low')
      .query('name=tz')
      .expect('x-mock', 'true')
      .expect(200);

    assert(res.body.path = '/?name=tz');
    assert(res.body.headers['x-client'] === 'unittest');
    assert(res.body.headers['x-case'] === 'low');
    assert(res.body.headers['x-forwarded-for'] === address.ip());
    assert(res.body.headers.host.startsWith('example.com'));
  });

  it('should filter headers', async () => {
    const res = await app.httpRequest()
      .get('/proxy/header')
      .set('te', 'compress')
      .expect('x-test', 'test')
      .expect('x-mock', 'true')
      .unexpectHeader('x-powered-by')
      .expect(200);

    assert(res.body.path = '/header');
    assert(!res.body.te);
  });

  it('should x-forwarded-for', async () => {
    const res = await app.httpRequest()
      .get('/proxy/header')
      .set('x-forwarded-for', '1.2.3.4')
      .expect('x-mock', 'true')
      .expect(200);

    assert(res.body.headers['x-forwarded-for'] === `1.2.3.4, ${address.ip()}`);
  });

  it('should PUT 204', async () => {
    await app.httpRequest()
      .put('/proxy/empty')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect('x-mock', 'true')
      .expect(204);
  });

  it('should POST', async () => {
    const res = await app.httpRequest()
      .post('/proxy/json')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .send({ a: 'b', foo: { bar: true } })
      .expect('x-mock', 'true')
      .expect(200);

    assert(res.body.requestBody.a === 'b');
    assert(res.body.requestBody.foo.bar === true);
    assert(res.body.headers['content-type'] === 'application/json');
  });

  it('should POST with form', async () => {
    const res = await app.httpRequest()
      .post('/proxy/json')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .type('form')
      .send({ a: 'b', foo: { bar: 'foo' } })
      .expect('x-mock', 'true')
      .expect(200);

    // nestedQuerystring
    assert(res.body.requestBody === 'a=b&foo%5Bbar%5D=foo');
    assert(res.body.headers['content-type'] === 'application/x-www-form-urlencoded');
  });

  it('should POST with plain', async () => {
    const res = await app.httpRequest()
      .post('/proxy/json')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .send('abc')
      .set('content-type', 'text/plain')
      .expect('x-mock', 'true')
      .expect(200);

    assert(res.body.requestBody === 'abc');
    assert(res.body.headers['content-type'] === 'text/plain');
  });

  describe('upload', () => {
    it('should upload file', async () => {
      const res = await app.httpRequest()
        .post('/proxy/upload')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .attach('test-content', Buffer.from('test string'), 'abc.txt')
        .attach('test-file', path.join(__dirname, './fixtures/file.txt'), 'test-file.txt')
        .field('a', 'b')
        .expect('x-mock', 'true')
        .expect(200);

      assert(res.body.fields.a === 'b');
      assert(res.body.files[0].fieldname === 'test-content');
      assert(res.body.files[0].filename === 'abc.txt');
      assert(res.body.files[0].content === 'test string');
      assert(res.body.files[1].fieldname === 'test-file');
      assert(res.body.files[1].filename === 'test-file.txt');
      assert(res.body.files[1].content === 'this is a test file\n');
      assert(res.body.headers['content-type'].startsWith('multipart/form-data'));
    });

    it('should upload file only field', async () => {
      const res = await app.httpRequest()
        .post('/proxy/upload')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .field('a', 'b')
        .expect('x-mock', 'true')
        .expect(200);

      assert(res.body.fields.a === 'b');
    });

    it('should upload file with file mode', async () => {
      const res = await app.httpRequest()
        .post('/proxy/uploadFileMode')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .attach('test-content', Buffer.from('test string'), 'abc.txt')
        .attach('test-file', path.join(__dirname, './fixtures/file.txt'), 'test-file.txt')
        .field('a', 'b')
        .expect('x-mock', 'true')
        .expect(200);

      assert(res.body.path = '/uploadFileMode');
      assert(res.body.fields.a === 'b');
      assert(res.body.files[0].fieldname === 'test-content');
      assert(res.body.files[0].filename === 'abc.txt');
      assert(res.body.files[0].content === 'test string');
      assert(res.body.files[1].fieldname === 'test-file');
      assert(res.body.files[1].filename === 'test-file.txt');
      assert(res.body.files[1].content === 'this is a test file\n');
    });

    it('should upload file with charset', async () => {
      const res = await app.httpRequest()
        .post('/proxy/upload')
        .set('cookie', 'csrfToken=abc')
        .set('x-csrf-token', 'abc')
        .query('_input_charset=utf-8')
        .attach('test-content', Buffer.from('test string 中文'), 'abc.txt')
        .field('a', 'this is 中文')
        .expect('x-mock', 'true')
        .expect(200);

      assert(res.body.fields.a === 'this is 中文');
      assert(res.body.files[0].content === 'test string 中文');
      assert(res.body.headers['content-type'].includes('charset=utf-8'));
    });
  });

  it('should download', async () => {
    const res = await app.httpRequest()
      .post('/proxy/download')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect('x-mock', 'true')
      .expect(200);

    assert(res.headers['content-type'] === 'application/octet-stream');
    assert(res.headers['content-disposition'] === 'attachment; filename="test-file.txt"');
    assert(res.body.toString() === 'this is a test file\n');
  });

  it('should proxy 500', async () => {
    const res = await app.httpRequest()
      .get('/proxy/error')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect('x-mock', 'true')
      .expect(500);

    assert(res.text === 'some error');
  });

  it('should timeout', async () => {
    await app.httpRequest()
      .get('/proxy/timeout')
      .set('cookie', 'csrfToken=abc')
      .set('x-csrf-token', 'abc')
      .expect(500);
  });

  describe('cookie', () => {
    it('should not send cookie when withCredentials = false && sameSite = false', async () => {
      const res = await app.httpRequest()
        .get('/proxy/cookie')
        .set('cookie', 'a=b')
        .expect('x-mock', 'true')
        .expect(200);

      assert(!res.body.cookie);
    });

    it('should send cookie when withCredentials = true && sameSite = false', async () => {
      const res = await app.httpRequest()
        .get('/proxy/cookie')
        .query('withCredentials=true')
        .set('cookie', 'a=b')
        .expect('x-mock', 'true')
        .expect(200);

      assert(res.body.path === '/cookie?withCredentials=true');
      assert(res.body.cookie === 'a=b');
    });

    it('should send cookie when withCredentials = false && sameSite = true', async () => {
      const res = await app.httpRequest()
        .get('/proxy/cookie')
        .query('same=true')
        .set('cookie', 'a=b')
        .unexpectHeader('x-mock')
        .expect(200);

      assert(res.body.path === '/cookie?same=true');
      assert(res.body.cookie === 'b');
    });

    it('should send cookie when withCredentials = true && sameSite = true', async () => {
      const res = await app.httpRequest()
        .get('/proxy/cookie')
        .query('same=true')
        .query('withCredentials=true')
        .set('cookie', 'a=b')
        .unexpectHeader('x-mock')
        .expect(200);

      assert(res.body.path === '/cookie?same=true&withCredentials=true');
      assert(res.body.cookie === 'b');
    });
  });

  it('should jump out of egg middleware', async () => {
    await app.httpRequest()
      .get('/proxy/header')
      .expect('x-mock', 'true')
      .unexpectHeader('post-middleware')
      .expect(200);
  });

  it('custom handler', async () => {
    const res = await app.httpRequest()
      .get('/proxy/handler')
      .set('test-header', 'true')
      .expect('x-mock', 'true')
      .expect(200);

    assert(res.body.path === '/proxy/handler');
    assert(res.body.test === true);
    assert(res.body.headers.a === 'c');
    assert(!res.body.headers['test-header']);
    assert(res.headers.addition === 'true');

    // jump
    assert(!res.headers['post-middleware']);
  });
});
