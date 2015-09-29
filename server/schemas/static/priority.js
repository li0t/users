'use strict';

/**
 * Static Priority documents schema.
 * It's purpose is to store tasks priority.
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
