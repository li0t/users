'use strict';

module.exports = function(Schema) {

  var InteractionSchema = new Schema({

    action: {
      type: Schema.Types.ObjectId,
      ref: 'static.action',
      required: true
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    token: {
      type: Schema.Types.ObjectId,
      ref: 'token'
    }

  });

  return InteractionSchema;

};
