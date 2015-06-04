/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {


  var ViewSchema = new Schema({

  });

  /** Show virtuals on JSON conversion */
  ViewSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  ViewSchema.pre('save', function (next) {
    next();
  });

  /** Lets populate reach any level */
  ViewSchema.plugin(deepPopulate);

  return ViewSchema;

};
