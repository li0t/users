/* jshint node: true */
'use strict';

module.exports = function (Schema) {

    return  new Schema({

        name: {
            type: String,
            required: true
        },

    });
  
};