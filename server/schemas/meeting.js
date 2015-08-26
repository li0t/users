'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function(Schema) {

  var MeetingSchema = new Schema({

    group: {
      type: Schema.Types.ObjectId,
      ref: 'group',
      required: true
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    dateTime: {
      type: Date,
      default: null
    },

    deleted: {
      type: Date,
      default: null
    },

    objective: { 
      type: String,
      required: true
    },

    items: [{ description : String, checked: Date }],

    attendants: [{

      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },

      joined: [Date],

      left: [Date]
    }],

    entries: [{

      entry: {
        type: Schema.Types.ObjectId,
        ref: 'entry'
      },

      added: Date

    }],

    notes: [{

      note: String,

      added: Date

    }],

    tags: [String]

  });

  /** Index string fields */
  MeetingSchema.index({ '$**': 'text' });

  /** Show virtuals on JSON conversion */
  MeetingSchema.set('toJSON', {
    virtuals: true
  });

  /** Show virtuals on JSON conversion */
  MeetingSchema.set('toObject', {
    virtuals: true
  });

  /** Task creation time */
  MeetingSchema.virtual('created').get(function() {
    return this._id.getTimestamp();
  });

  /** Task creation time */
  MeetingSchema.virtual('completed').get(function() {
    return this.dateTime && this.dateTime < new Date();
  });

  /** Declares Object type */
  MeetingSchema.virtual('type').get(function() {
    return 'meeting';
  });

  /** Check the date time is set in the future */
  MeetingSchema.path('dateTime').validate(function(dateTime, cb) {

      if (dateTime && dateTime !== this.dateTime && dateTime <= new Date()) {
        cb(false);
      }

    cb(true);

  }, 'The meeting date time must be in the future!');


  /** Lets populate reach any level */
  MeetingSchema.plugin(deepPopulate, {
    populate: {

      'group.profile': {
        select: 'name location pictures'
      },

      'entries.user': {
        select: 'email'
      },

      'members': {
        select: 'user'
      }

    }
  });

  return MeetingSchema;

};
