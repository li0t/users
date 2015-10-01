'use strict';

var deepPopulate = require('mongoose-deep-populate');
var mongoose = require('mongoose');

/**
 * Profile documents schema.
 * Profiles are intended to store users and groups data and pictures.
 *
 * @type Mongoose Schema.
 */
module.exports = function(Schema) {

  var ProfileSchema = new Schema({

    name: {
      type: String
    },

    birthdate: {
      type: Date
    },

    gender: {
      type: Schema.Types.ObjectId,
      ref: 'static.gender',
      default: null
    },

    location: {
      type: String
    },

    pictures: [{
      type: Schema.Types.ObjectId,
      ref: 'fs.file'
    }],

    updated: {
      type: Date,
      default: Date.now
    }

  });

  /** Check the profile gender is valid */
  ProfileSchema.path('gender').validate(function(gender, cb) {

    if (gender) {

      mongoose.model('static.gender').

      findById(gender).

      exec(function(err, found) {

        if (!err && found) {
          cb(true);

        } else {
          cb(false);

        }
      });
    } else {
      cb(true);

    }
  }, 'You must set a valid gender!');

  /** Show virtuals on JSON conversion */
  ProfileSchema.set('toJSON', {
    virtuals: true
  });

  /** Lets populate reach any level */
  ProfileSchema.plugin(deepPopulate);

  return ProfileSchema;

};
