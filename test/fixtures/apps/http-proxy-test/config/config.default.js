'use strict';

exports.keys = '123456';

exports.multipart = {
  fileExtensions: [ '.txt' ],
  fileModeMatch: [ '/real', '/proxy/uploadFileMode' ],
};

exports.middleware = [ 'test' ];

exports.test = {
  match: '/proxy',
};

exports.httpProxy = {
  withCredentials: false,
};

