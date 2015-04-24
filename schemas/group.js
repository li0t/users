/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

  var GroupSchema = new Schema({

    profile: {
      type: Schema.Types.ObjectId,
      ref: 'profile',
      required: true
    },

    admin: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    members: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }]

  });

  /** Show virtuals on JSON conversion */
  GroupSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  GroupSchema.pre('save', function (next) {
    next();
  });

  /** Lets populate reach any level */
  GroupSchema.plugin(deepPopulate);

  return GroupSchema;
  
};