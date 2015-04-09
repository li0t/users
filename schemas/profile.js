/* jshint node: true */
'use strict';

module.exports = function (Schema) {

    var ProfileSchema = new Schema({

        name: {
            type: String
        },

        birthdate: {
            type: Date
        },

        gender: {
            type: Schema.Types.ObjectId,
            ref: 'static.gender'
        },

        location: {
            type: String
        },

        pictures: [{
            type: Schema.Types.ObjectId,
            ref: 'fs.file'
        }],

        contacts: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],

        metadata: [{
            title: String,
            content: String
            }],

        updated: {
            type: Date,
            default: Date.now
        }

    });


    /** Show virtuals on JSON conversion */
    ProfileSchema.set('toJSON', {
        virtuals: true
    });

    /**  */
    ProfileSchema.pre('save', function (next) {
        next();
    });

    return ProfileSchema;
};