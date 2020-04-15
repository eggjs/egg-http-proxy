'use strict';


module.exports = app => {
  const { router, controller } = app;

  router.get('/proxy', controller.proxy.index);
  router.post('/proxy/json', controller.proxy.index);
  router.get('/proxy/nocache', controller.proxy.nocache);
};
