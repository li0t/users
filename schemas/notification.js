/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

    var NotificationSchema = new Schema({

        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },


        purpose: {
            type: Schema.Types.ObjectId,
            ref: 'static.purpose',
            default: null
        },

        viewed: {
            type: Date
        },

        accepted: {
            type: Date
        },

        declined: {
            type: Date
        },

    });


    /** Show virtuals on JSON conversion */
    NotificationSchema.set('toJSON', {
        virtuals: true
    });

    /**  */
    NotificationSchema.pre('save', function (next) {
        next();
    });


    /** Lets populate reach any level */
    NotificationSchema.plugin(deepPopulate);


    return NotificationSchema;
};