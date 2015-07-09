'use strict';

var path = require('path');

module.exports = function (app) {
  var basedir = path.join('server', 'views');
  var engine = 'jade';

  app.locals.basedir = basedir;

  return {
    basedir: basedir,
    engine: engine
  };

};
