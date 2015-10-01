'use strict';

module.exports = function(Schema) {

  /**
   * Tag documents schema.
   * Tags are used to link data and to provide search metadata.
   *
   * @type Mongoose Schema.
   */
  var TagSchema = new Schema({

    name: {
      required: true,
      type: String,
      unique:true
    }

  });

  /** Index name field */
  TagSchema.index({ 'name': 'text' });

  return TagSchema;

};
