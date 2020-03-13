'use strict';


module.exports = app => {
  const { router, controller } = app;

  router.get('/proxy', controller.proxy.index);
  router.get('/proxy/header', controller.proxy.index);
  router.put('/proxy/empty', controller.proxy.index);
  router.post('/proxy/json', controller.proxy.index);

  router.post('/proxy/upload', controller.proxy.index);
  router.post('/proxy/uploadFileMode', controller.proxy.index);
  router.post('/proxy/download', controller.proxy.index);

  router.get('/proxy/error', controller.proxy.index);
  router.get('/proxy/timeout', controller.proxy.timeout);

  router.get('/proxy/cookie', controller.proxy.cookie);
  router.get('/cookie', ctx => {
    ctx.body = {
      path: ctx.originalUrl,
      cookie: ctx.cookies.get('a', { signed: false }),
    };
  });

  router.get('/proxy/handler', controller.proxy.handler);
};
