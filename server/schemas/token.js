'use strict';

var uuid = require('node-uuid');
var crypto = require('crypto');

/**
 * Token documents schema.
 * Tokens are mainly used for validations and to protect database relevant data.
 *
 * @type Mongoose Schema.
 */
module.exports = function(Schema) {

  var TokenSchema = new Schema({

    secret: {
      type: String
    }

  });

  /** Hash unique token secret string */
  TokenSchema.pre('validate', function(next) {
    this.secret = crypto.createHash('sha1').update(uuid.v4()).digest().toString('hex');
    next();
  });

  return TokenSchema;

};
