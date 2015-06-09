/* jshint node: true */
'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

module.exports = function(Schema) {

  var Gender = mongoose.model('static.gender');

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

  /** Check the set gender is valid */
  ProfileSchema.path('gender').validate(function(gender, cb) {

    if (gender) {

      Gender.findById(gender, function(err, found) {

        if (!err && found) {
          cb(true);
        } else {
          cb(false);
        }

      });

    } else {
      cb(true);
    }

  }, 'You must set a valid gender');

  /** Show virtuals on JSON conversion */
  ProfileSchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  ProfileSchema.pre('save', function(next) {
    next();
  });

  /** Lets populate reach any level */
  ProfileSchema.plugin(deepPopulate);

  return ProfileSchema;

};
