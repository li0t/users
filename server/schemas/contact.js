'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

  var contact = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    state: {
      type: Schema.Types.ObjectId,
      ref: 'static.state'
    }

  });

  /** Lets populate reach any level */
  contact.plugin(deepPopulate, {
    populate :{

      'user' : {
        select : 'email profile'
      },

      'user.profile' : {
        select : 'name birthdate gender location'
      }

    }

  });

  var ContactSchema = new Schema({

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    contacts: [contact]

  });

  /** Show virtuals on JSON conversion */
  ContactSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  ContactSchema.pre('save', function (next) {
    next();
  });

  /** Check for be-contact-of-myself attempt */
  ContactSchema.path('contacts').validate(function(contacts, cb){

    var self = this;

    contacts.forEach(function(contact){
      if (JSON.stringify(contact.user) === JSON.stringify(self.user)) {
        cb(false);
      }
    });

    cb(true);

  }, 'You cannot be contact of yourself. Come on!');

  /** Lets populate reach any level */
  ContactSchema.plugin(deepPopulate, {
    populate :{

      'contacts.user' : {
        select : 'email profile'
      },

      'contacts.user.profile' : {
        select : 'name birthdate gender location'
      }

    }

  });

  return ContactSchema;

};
