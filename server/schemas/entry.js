'use strict';

var deepPopulate = require('mongoose-deep-populate');

/**
 * Entry documents schema.
 * Entries is a category of documents that users can create
 * or upload to the platform such as notes or images.
 *
 * @type Mongoose Schema.
 */
module.exports = function (Schema) {

  var EntrySchema = new Schema({

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    group : {
      type: Schema.Types.ObjectId,
      ref: 'group',
      required: true
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

    documents: [{
      type: Schema.Types.ObjectId,
      ref: 'fs.file'
    }],

    audios: [{
      type: Schema.Types.ObjectId,
      ref: 'fs.file'
    }],

    tags: [String],

    updated: {
      type: Date,
      default: Date.now
    }

  });

/** Index entry fields with text */
  EntrySchema.index({ '$**': 'text' });

  /** Show virtuals on JSON conversion */
  EntrySchema.set('toJSON', {
    virtuals: true
  });

  /** Entry creation timestamp */
  EntrySchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /** Declares Object type as front-end convenient data */
  EntrySchema.virtual('type').get(function () {
    var type = 'note';

    if (this.pictures.length > 0 && !this.content) {
      type = 'image';
    } else if (this.documents.length > 0) {
      type = 'document';
    } else if (this.audios.length > 0) {
      type = 'audio';
    }

    return type;

  });

  /** Lets populate reach any level */
  EntrySchema.plugin(deepPopulate, {
    populate :{

      'user' : {
        select : 'email profile'
      },

      'user.profile' : {
        select : 'name'
      },

      'group' : {
        select : 'members profile'
      },

      'group.members' : {
        select : 'email profile'
      },

      'group.profile' : {
        select : 'name'
      }

    }
  });

  return EntrySchema;

};
