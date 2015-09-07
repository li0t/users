'use strict';

var base64url = require('base64url');
var uuid = require('node-uuid');
var crypto = require('crypto');

module.exports = function(Schema) {

  var TokenSchema = new Schema({

    secret: {
      type: String
    }

  });

  TokenSchema.pre('validate', function(next) {
    this.secret = base64url(crypto.createHash('sha256').update(uuid.v4()).digest());
    next();
  });

  return TokenSchema;

};
