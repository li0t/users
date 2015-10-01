'use strict';

/**
 * GridFS File documents schema.
 * GridFS Files purpose is to store files directly to Mongo.
 *
 * @type Mongoose Schema.
 */
module.exports = function (Schema) {

  return new Schema({

    filename: String,

    contentType: String,

    length: Number,

    chunkSize: Number,

    uploadDate: Date,

    aliases: [String],

    metadata: Schema.Types.Mixed,

    md5: String

  });

};
