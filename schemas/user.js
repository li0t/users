'use strict';

var validator = require('validator'),
    bcrypt = require('bcrypt');

module.exports = function (Schema) {

    /* Stores the user's info */
    var infoSchema = new Schema({

        firstname: {
            type: String,
            required: true
        },

        lastname: {
            type: String,
            required: true
        },

        birthdate: {
            type: Date,
            required: true
        },

        gender: {
            type: Schema.Types.ObjectId,
            ref: 'static.gender',
            required: true
        },

        location: {
            type: String,
            required: true
        }

    });

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

        info: {
            type: [infoSchema],
            required: true
        },

        profilePic: {
            type: Schema.Types.ObjectId,
            ref: 'fs.file',
        },

        contactos: {
            type: [String]
        },

        metadata: {
            type: [{
                title: String,
                content: String
            }],
        },

        updated: {
            type: Date,
            default: Date.now
        },

        state: {
            type: Schema.Types.ObjectId,
            ref: 'static.state'
        }

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

    return UserSchema;
}