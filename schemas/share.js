/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {


  var ShareSchema = new Schema({

  });

  /** Show virtuals on JSON conversion */
  ShareSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  ShareSchema.pre('save', function (next) {
    next();
  });

  /** Lets populate reach any level */
  ShareSchema.plugin(deepPopulate);

  return ShareSchema;

};
