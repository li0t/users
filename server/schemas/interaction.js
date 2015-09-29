'use strict';

var deepPopulate = require('mongoose-deep-populate');

var Notifications = component('notifications');

/**
 * Interaction documents schema.
 * Interactions are temporary documents to store users actions.
 *
 * @type Mongoose Schema.
 */
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

  /** Interaction timestamp */
  InteractionSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /** Call notifications component on each created interaction */
  InteractionSchema.post('save', function(doc) {
    Notifications.notify(doc);
  });

  /** Call notifications component on each removed interaction */
  InteractionSchema.pre('remove', function(next) {
    Notifications.clean(this);
    next();
  });

  return InteractionSchema;

};
