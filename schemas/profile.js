/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

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


    /** Show virtuals on JSON conversion */
    ProfileSchema.set('toJSON', {
        virtuals: true
    });

    /**  */
    ProfileSchema.pre('save', function (next) {
        next();
    });


    /** Lets populate reach any level */
    ProfileSchema.plugin(deepPopulate);


    return ProfileSchema;
};