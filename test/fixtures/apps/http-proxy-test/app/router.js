'use strict';

const assert = require('assert');

module.exports = app => {
  const { router, controller } = app;

  // proxy router
  router.use('/proxy', async (ctx, next) => {
    assert(ctx.get('x-client') === 'unittest');
    ctx.set('x-proxy', 'true');
    await next();
  });
  router.get('/proxy', controller.proxy.index);
  router.put('/proxy/empty', controller.proxy.empty);
  router.get('/proxy/header', controller.proxy.header);
  router.get('/proxy/handler', controller.proxy.handler);
  router.get('/proxy/error', controller.proxy.error);
  router.get('/proxy/timeout', controller.proxy.timeout);
  router.get('/proxy/cookie', controller.proxy.cookie);
  router.post('/proxy/json', controller.proxy.json);
  router.post('/proxy/plain', controller.proxy.plain);
  router.post('/proxy/upload', controller.proxy.upload);
  router.post('/proxy/uploadFileMode', controller.proxy.uploadFileMode);
  router.post('/proxy/download', controller.proxy.download);


  // real router
  router.use('/real', async (ctx, next) => {
    ctx.set('x-origin', 'real-server');
    await next();
  });

  router.get('/real', controller.real.index);
  router.get('/real/header', controller.real.header);
  router.put('/real/empty', controller.real.empty);
  router.get('/real/error', controller.real.error);
  router.get('/real/cookie', controller.real.cookie);
  router.post('/real/json', controller.real.json);
  router.post('/real/plain', controller.real.plain);
  router.post('/real/upload', controller.real.upload);
  router.post('/real/download', controller.real.download);
};
