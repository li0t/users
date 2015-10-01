'use strict';

/**
 * Static State documents schema.
 * It's purpose is to store other documents state like "active".
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
