/* jshint node: true */
'use strict';

var validator = require('validator'),
    bcrypt = require('bcrypt'),
    deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

  var UserSchema = new Schema({

    email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        validator.isEmail,
        "Uh oh, looks like you don't know how to write an email address. Go back to your cave."
      ]
    },

    password: {
      type: String,
      required: true
    },

    state: {
      type: Schema.Types.ObjectId,
      ref: 'static.state',
      required: true
    },

    profile: {
      type: Schema.Types.ObjectId,
      ref: 'profile',
      required: true
    },

    updated: {
      type: Date,
      default: Date.now
    },

  });

  /** User's sign up date */
  UserSchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /** Show virtuals on JSON conversion */
  UserSchema.set('toJSON', {
    virtuals: true
  });

  /** Hash user's password before saving */
  UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
      bcrypt.hash(user.password, 8, function (err, hash) {
        if (err) {
          next(err);
        } else {
          user.password = hash;
          next();
        }
      });
    } else {
      next();
    }

  });

  /** Lets populate reach any level */
  UserSchema.plugin(deepPopulate);

  return UserSchema;

};