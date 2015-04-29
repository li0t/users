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

    relatedMeetings: [{
      type: Schema.Types.ObjectId,
      //  ref: ''
    }],

    relatedObjects: [{ /** Are this entries? */
      type: Schema.Types.ObjectId,
      //  ref: ''
    }],

    notes: [String],

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