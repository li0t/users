/* jshint node: true */
'use strict';

module.exports = function (Schema) {

  var EntrySchema = new Schema({

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },

    title: {
      type: String
    },

    content: {
      type: String
    },

    pictures: [{
      type: Schema.Types.ObjectId,
      ref: 'fs.file'
        }],

    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'tag'
        }],

    updated: {
      type: Date,
      default: Date.now
    }

  });


  /** Show virtuals on JSON conversion */
  EntrySchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  EntrySchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /**  */
  EntrySchema.pre('save', function (next) {
    next();
  });
  

  return EntrySchema;
};