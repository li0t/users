'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

  var GroupSchema = new Schema({

    profile: {
      type: Schema.Types.ObjectId,
      ref: 'profile',
      required: true
    },

    admin: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    members: [{

      user: { type: Schema.Types.ObjectId, ref: 'user'},

      joined : [Date],

      left: [Date]

    }],
    
    updated: {
      type: Date,
      default: Date.now
    }

  });

  /** User's sign up date */
  GroupSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /** Show virtuals on JSON conversion */
  GroupSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  GroupSchema.pre('save', function (next) {
    next();
  });

  /** Lets populate reach any level */
  GroupSchema.plugin(deepPopulate,{
    populate :{

      'admin' : {
        select : 'email profile'
      },

      'admin.profile' : {
        select : 'name birthdate gender location'
      },

      'members' : {
        select : 'email profile'
      },

      'members.profile' : {
        select : 'name birthdate gender location'
      }

    }
  });

  return GroupSchema;

};
