'use strict';

var deepPopulate = require('mongoose-deep-populate');

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

  /**  */
  NotificationSchema.pre('save', function (next) {
    next();
  });


  /** Lets populate reach any level */
  NotificationSchema.plugin(deepPopulate);

  NotificationSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  return NotificationSchema;
};
