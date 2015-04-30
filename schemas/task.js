/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

  var TaskSchema = new Schema({

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

  /**  */
  TaskSchema.pre('save', function (next) {
    next();
  });


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