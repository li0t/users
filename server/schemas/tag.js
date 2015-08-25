'use strict';

module.exports = function(Schema) {

  var TagSchema = new Schema({

    name: {
      required: true,
      type: String,
      unique:true
    }

  });

  /** Index string fields */
  TagSchema.index({ 'name': 'text' });

  return TagSchema;
};
