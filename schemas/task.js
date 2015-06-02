/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function(Schema) {

  var TaskSchema = new Schema({

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

    completed: {
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

    collaborators: [{

      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },

      joined: [Date],

      left: [Date]

    }],

    priority: {
      type: Schema.Types.ObjectId,
      ref: 'static.priority',
      required: true
    },

    entries: [{

      entry: {
        type: Schema.Types.ObjectId,
        ref: 'entry'
      },

      added: Date

    }],

    /*meetings: [{
      type: Schema.Types.ObjectId,
      //  ref: ''
    }],*/

    dateTime: Date,

    notes: [{
      type: String,
      added: Date
    }]

  });

  /** Show virtuals on JSON conversion */
  TaskSchema.set('toJSON', {
    virtuals: true
  });

  /** Task creation time */
  TaskSchema.virtual('created').get(function() {
    return this._id.getTimestamp();
  });

  /** Check the date time is set in the future */
  TaskSchema.path('dateTime').validate(function(dateTime, cb) {

    if (dateTime && dateTime <= new Date()) {
      cb(false);
    }

    cb(true);

  }, 'The task date time must be in the future!');

  /** Lets populate reach any level */
  TaskSchema.plugin(deepPopulate, {
    populate: {

      'group.profile': {
        select: 'name location pictures'
      },

      'entries.user': {
        select: 'email'
      },

      'collaborators': {
        select: 'email'
      }

    }
  });

  return TaskSchema;

};
