/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

  var PollSchema = new Schema({ /** TODO: Implement link to meetings */

    task: {
      type: Schema.Types.ObjectId,
      ref: 'task',
      required: true
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    state: {
      type: Schema.Types.ObjectId,
      ref: 'static.state',
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
    },

    location: {
      type: String,
    },

    dates: [{

      day: { type: Date, required: true },

      hours: { type: [Number], required: true},

      _id: false,
      id: false

    }],

    collaborators: [{

      user : {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
      },

      answer : [{

        day: { type: Date },

        hours: { type: [Boolean] },

        _id: false,
        id: false

      }],

      _id: false,
      id: false

    }],

    updated: {
      type: Date,
      default: Date.now
    }

  });

  /** Show virtuals on JSON conversion */
  PollSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  PollSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /**  */
  PollSchema.pre('save', function (next) {
    next();
  });

  /** Lets populate reach any level */
  PollSchema.plugin(deepPopulate);

  return PollSchema;

};