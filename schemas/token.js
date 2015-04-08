/* jshint node: true */
'use strict';

module.exports = function (Schema) {

    var tokenSchema = new Schema({

        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },

        createdAt: {
            type: Date,
            expires: '1d',
            default: Date.now
        }

    });

    return tokenSchema;
};