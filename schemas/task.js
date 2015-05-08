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

    state: {
      type: Schema.Types.ObjectId,
      ref: 'static.state',
      required: true
    },

    objective: {
      type: String,
      required: true
    },

    collaborators: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],

    priority : {
      type: Schema.Types.ObjectId,
      ref: 'static.priority',
      required: true
    },

    entries: [{ 
      type: Schema.Types.ObjectId,
      ref: 'entry'
    }],

    /*meetings: [{
      type: Schema.Types.ObjectId,
      //  ref: ''
    }],*/
    
    dateTime : Date,

    notes: [String]

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

      'collaborators' : {
        select : 'email profile'
      },

      'collaborators.profile' : {
        select : 'name birthdate gender location'
      }

    }
  });

  return TaskSchema;

};