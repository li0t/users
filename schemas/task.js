/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

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

    status: {
      type: Schema.Types.ObjectId,
      ref: 'static.state',
      required: true
    },

    objective: {
      type: String,
      required: true
    },

    users: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],

    priority : {
      type: Schema.Types.ObjectId,
      ref: 'static.priority',
      required: true
    },

    dateTime : Date,

    notes: [String],

    entries: [{ 
      type: Schema.Types.ObjectId,
      ref: 'entry'
    }]/*,

    relatedMeetings: [{
      type: Schema.Types.ObjectId,
      //  ref: ''
    }],*/

  });

  /** Show virtuals on JSON conversion */
  TaskSchema.set('toJSON', {
    virtuals: true
  });

  /** Task creation time */
  TaskSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /** Check the date time is set in the future */
  TaskSchema.path('dateTime').validate(function(dateTime, cb){
    if (dateTime <= new Date()) {
      cb(false);
    }
    cb(true);
  }, 'The task date time must be in the future!');

  /** Lets populate reach any level */
  TaskSchema.plugin(deepPopulate, {
    populate :{

      'users' : {
        select : 'email profile'
      },

      'users.profile' : {
        select : 'name birthdate gender location'
      }

    }
  });

  return TaskSchema;

};