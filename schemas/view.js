/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {


  var ViewSchema = new Schema({

    viewer: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    entry: {
      type: Schema.Types.ObjectId,
      ref: 'entry'
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: 'task'
    },

    group: {
      type: Schema.Types.ObjectId,
      ref: 'group'
    },

    share: {
      type: Schema.Types.ObjectId,
      ref: 'share'
    },

    views: [Date]


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
