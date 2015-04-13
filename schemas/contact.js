/* jshint node: true */
'use strict';

var deepPopulate = require('mongoose-deep-populate');

module.exports = function (Schema) {

    var ContactSchema = = new Schema({

        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        
        contacts: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],

    });
    
     /** Show virtuals on JSON conversion */
    ContactSchema.set('toJSON', {
        virtuals: true
    });

    /**  */
    ContactSchema.pre('save', function (next) {
        next();
    });
    
    /** Lets populate reach any level */
    ContactSchema.plugin(deepPopulate);

};