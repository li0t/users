'use strict';

var uuid = require('node-uuid');
var crypto = require('crypto');

module.exports = function(Schema) {

  var TokenSchema = new Schema({

    secret: {
      type: String
    }

  });

  TokenSchema.pre('validate', function(next) {
    this.secret = crypto.createHash('sha1').update(uuid.v4()).digest().toString('hex');
    next();
  });

  return TokenSchema;

};
