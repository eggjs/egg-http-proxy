'use strict';

exports.keys = '123456';

exports.multipart = {
  fileExtensions: [ '.txt' ],
  fileModeMatch: [ '/proxy/uploadFileMode' ],
};

exports.middleware = [ 'test' ];

exports.httpProxy = {
  withCredentials: false,
};

