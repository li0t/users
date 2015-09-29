'use strict';

/**
 * Static Action documents schema.
 * It's purpose is to store users actions.
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
