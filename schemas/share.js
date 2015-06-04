/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function(Schema) {


  var ShareSchema = new Schema({

    from: {

      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
      },

      task: {
        type: Schema.Types.ObjectId,
        ref: 'task'
      },

      group: {
        type: Schema.Types.ObjectId,
        ref: 'group'
      }

    },

    to: {

      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },

      task: {
        type: Schema.Types.ObjectId,
        ref: 'task'
      },

      group: {
        type: Schema.Types.ObjectId,
        ref: 'group'
      }

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

    editable: {
      type: Boolean,
      required: true
    },

    shareable: {
      type: Boolean,
      required: true
    },

    expires: Date,

    maxViews: Number

  });

  /** Check the maximun views limit is greater than 0 */
  ShareSchema.path('maxViews').validate(function(maxViews, cb) {

    if (maxViews && maxViews <= 0) {
      cb(false);
    }

    cb(true);

  }, 'The views limit must be greater than 0!');

  /** Check the expiratiom time is set in the future */
  ShareSchema.path('expires').validate(function(expires, cb) {

    if (expires && expires <= new Date()) {
      cb(false);
    }

    cb(true);

  }, 'The expiration time must be in the future!');

  /** Show virtuals on JSON conversion */
  ShareSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  ShareSchema.virtual('sharedAt').get(function() {
    return this._id.getTimestamp();
  });

  /**  */
  ShareSchema.pre('save', function(next) {
    next();
  });

  /** Lets populate reach any level */
  ShareSchema.plugin(deepPopulate);

  return ShareSchema;

};
