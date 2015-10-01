'use strict';

/**
 * Static Gender documents schema.
 * It's purpose is to store users gender.
 *
 * @type Mongoose Static Schema.
 */
module.exports = function (Schema) {

  return new Schema({

    slug: {
      type: String,
      required: true,
      unique: true
    },

    name: String

  });

};
