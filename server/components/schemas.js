/* jshint node: true */
/* global panic */
'use strict';

var walk = require('walk');
var path = require('path');
var fs = require('fs');
var util = require('util');
var color = require('colors');
var mongoose = require('mongoose');
var debug = require('debug')('app:schemas');
var inflection = require('inflection');

function getName() {
  return getPath.apply(null, arguments).replace(/\\+|\/+/g, '.').replace(/^\.+/, '');
}

function getPath() {
  return path.normalize(path.join.apply(null, arguments));
}

module.exports = function (basedir) {

  walk.walkSync(basedir, {
    listeners: {
      file: function (root, stats, next) {
        if (path.extname(stats.name) === '.js') {

          var file = getPath(root, stats.name), /* Get file name */
              schema = require(file)(mongoose.Schema), /* Require the file and pass the Mongoose Schema object */
              name = getName(root.replace(basedir, ''), path.basename(stats.name, '.js')); /* Generate the schema name */

          /* Create the model in Mongoose */
          mongoose.model(name, schema);

          debug(name + " --> " + file);
        }

        next();
      },

      errors: function (root, stats, next) {
        panic("Could not register schemas!\n", root, stats);
      }
    }
  });

};
