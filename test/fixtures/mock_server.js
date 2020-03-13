'use strict';

const nock = require('nock');
const asyncBusboy = require('async-busboy');
const intoStream = require('into-stream');
const getStream = require('get-stream');

exports.mock = () => {
  const scope = nock(/example\.com/);

  scope.defaultReplyHeaders({
    'x-mock': 'true',
  });

  // scope.log(console.log);

  scope.get('/?name=tz').reply(200, function(url, requestBody) {
    return {
      path: url,
      headers: this.req.headers,
      query: this.req.query,
      requestBody,
    };
  });

  scope.get('/header').reply(200, function(url, requestBody) {
    return {
      path: url,
      headers: this.req.headers,
      query: this.req.query,
      requestBody,
    };
  }, { 'X-Powered-By': 'nock', 'X-TEST': 'test' });

  scope.put('/empty').reply(204);

  scope.post('/json').reply(200, function(url, requestBody) {
    return {
      path: url,
      headers: this.req.headers,
      query: this.req.query,
      requestBody,
    };
  });

  scope.post(/^\/upload/).reply(200, async function(url, requestBody, cb) {
    try {
      const { files, fields } = await asyncBusboy(intoStream(requestBody), { headers: this.req.headers });

      const requestFiles = [];
      for (const file of files) {
        const content = await getStream(file);
        requestFiles.push({
          fieldname: file.fieldname,
          filename: file.filename,
          content,
        });
      }

      cb(null, {
        path: url,
        headers: this.req.headers,
        query: this.req.query,
        requestBody,
        files: requestFiles,
        fields,
      });
    } catch (err) {
      cb(err);
    }
  });

  scope.post('/download').replyWithFile(200, __dirname + '/file.txt', {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="test-file.txt"',
  });

  scope.get('/error').reply(500, 'some error');

  scope.get('/timeout').delay(2000).reply(200, 'should not got this');

  scope.get(/^\/cookie/).reply(200, function(url) {
    return {
      path: url,
      cookie: this.req.headers.cookie,
    };
  });

  scope.get('/proxy/handler').reply(200, function(url, requestBody) {
    return {
      path: url,
      headers: this.req.headers,
      query: this.req.query,
      requestBody,
    };
  }, { 'X-Powered-By': 'nock', 'X-TEST': 'test' });

  return scope;
};

exports.restore = () => nock.cleanAll();
