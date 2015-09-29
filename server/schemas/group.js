'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function(Schema) {

  /**
   * Group documents schema.
   * Groups are the central model of work and are composed by users.
   *
   * @type Mongoose Schema.
   */
  var GroupSchema = new Schema({

    profile: {
      type: Schema.Types.ObjectId,
      ref: 'profile',
      required: true
    },

    admin: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    members: [{

      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },

      joined: [Date],

      left: [Date]

    }],

    updated: {
      type: Date,
      default: Date.now
    }

  });

  /** Group creation timestamp  */
  GroupSchema.virtual('created').get(function() {
    return this._id.getTimestamp();
  });

  /** Declares Object type as front-end convenient data */
  GroupSchema.virtual('type').get(function() {
    return 'group';
  });

  /** Show virtuals on JSON conversion */
  GroupSchema.set('toJSON', {
    virtuals: true
  });

  /** Remove not-active group members **/
  GroupSchema.methods.cleanMembers = function() {

    var i;

    for (i = 0; i < this.members.length; i++) {

      if (this.members[i].left.length && this.members[i].left.length === this.members[i].joined.length) {

        this.members.splice(i, 1);
        i -= 1;
      }
    }

  };

  /** Lets populate reach any level */
  GroupSchema.plugin(deepPopulate, {
    populate: {

      'admin': {
        select: 'email profile'
      },

      'admin.profile': {
        select: 'name birthdate gender location'
      },

      'members': {
        select: 'email profile'
      },

      'members.profile': {
        select: 'name birthdate gender location'
      }

    }
  });

  return GroupSchema;

};
