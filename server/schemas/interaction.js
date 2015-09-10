'use strict';

var deepPopulate = require('mongoose-deep-populate');

var Notifications = component('notifications');

module.exports = function(Schema) {

  var InteractionSchema = new Schema({

    action: {
      type: Schema.Types.ObjectId,
      ref: 'static.action',
      required: true
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    token: {
      type: Schema.Types.ObjectId,
      ref: 'token'
    },

    modelRelated: Schema.Types.ObjectId

  });

  /** Lets populate reach any level */
  InteractionSchema.plugin(deepPopulate, {});

  InteractionSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  InteractionSchema.post('save', function(doc) {
    Notifications.notify(doc);
  });

  InteractionSchema.pre('remove', function(next) {
    Notifications.clean(this);
    next();
  });

  return InteractionSchema;

};
