'use strict';

var deepPopulate = require('mongoose-deep-populate');

/**
 * Notification documents schema.
 * Notifications provide real time information to users.
 *
 * @type Mongoose Schema.
 */
module.exports = function (Schema) {

  var NotificationSchema = new Schema({

    interaction: {
      type: Schema.Types.ObjectId,
      ref: 'interaction'
    },

    viewed: {
      type: Date
    }

  });

  /** Show virtuals on JSON conversion */
  NotificationSchema.set('toJSON', {
    virtuals: true
  });

  /** Lets populate reach any level */
  NotificationSchema.plugin(deepPopulate);

  NotificationSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  return NotificationSchema;
  
};
