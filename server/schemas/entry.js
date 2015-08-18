'use strict';

var deepPopulate = require('mongoose-deep-populate');

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

  /** Show virtuals on JSON conversion */
  EntrySchema.set('toJSON', {
    virtuals: true
  });

  /**  */
  EntrySchema.virtual('created').get(function () {
    return this._id.getTimestamp();
  });

  /** Declares Object type */
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

  /**  */
  EntrySchema.pre('save', function (next) {
    next();
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
