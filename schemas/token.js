'use strict';

var Schema = mongoose.Schema;

module.exports = function (Schema) {

    var tokenSchema = new Schema({

        code: {
            type: String,
            unique: true,
            default: function () {
                return uid(124);
            }
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },

        expires: {
            type: Date,
            default: function () {
                var today = new Date();
                var length = 60; // Length (in minutes) of our access token
                return new Date(today.getTime() + length * 60000);
            }
        },

        active: {
            type: Boolean,
            get: function (value) {
                if (expires < new Date() || !value) {
                    return false;
                } else {
                    return value;
                }
            },
            default: true
        }
    });

    return tokenSchema;
}