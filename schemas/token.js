/* jshint node: true */
'use strict';

module.exports = function (Schema) {

  return new Schema({

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    sender : {
      type: Schema.Types.ObjectId,
      ref: 'user',
      default: null
    },

    createdAt: {
      type: Date,
      expires: '365d',
      default: Date.now
    }

  });

};