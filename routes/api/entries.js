/* jshint node: true */
/* global component */
'use strict';

module.exports = function (router, mongoose) {

  var Entry = mongoose.model('entry'),
    Tag = mongoose.model('tag'),
    debug = require('debug')('app:api:entries');

  var gridfs = component('gridfs');

  /**
   * Creates a new entry
   */
  router.post('/create', function (req, res, next) {

    var entry, /* This is the target schema */
      tags = [] /* The tags to be stored in the entry */ ,
      saved = 0;

    /** 
     * Looksup for tags provided by the user
     * if one is not found creates a new tag and stores the id
     */
    (function tagsLookup() {
      if (req.body.tags && req.body.tags.length) {
        req.body.tags.forEach(function (tag) {
          Tag.find()
            .where('name', tag)
            .exec(function (err, found) {
              if (err) {
                debug(err);
              } else if (found) {
                tags.push(found._id);
              } else {
                new Tag({
                  name: tag
                }, function (err, newTag) {
                  if (err) {
                    debug(err);
                  } else {
                    tags.push(newTag._id);
                  }
                });
              }
            });
        });
      }
    })();

    /**
     * Create the document with the saved File ids
     */
    function saveEntry() {
      entry.save(function (err) {
        if (err) {
          next(err);
        } else {
          entry.deepPopulate('pictures tags user.contacts user.state user.profile')
            .exec(function (err, _entry) {
              if (err) {
                next(err);
              } else {
                res.status(204).send(_entry);
              }
            });
        }
      });
    }

    function savePictures() {
      function onclose(fsFile) {
        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        entry.pictures.push(fsFile._id); /* Add the picture's id to the entry.pictures array */

        saved += 1;

        /* Check if all files where streamed to the database */
        if (saved === req.files.length) {
          debug('All files saved');
          saveEntry();
        }
      }

      function onerror(err) {
        debug('Error streaming file!');
        next(err);
      }

      req.files.forEach(function (file) {
        debug('Saving %s', file.filename);

        var writestream = gridfs.save(file.data, {
          content_type: file.mimetype,
          filename: file.filename,
          mode: 'w'
        });

        writestream.on('close', onclose); /* The stream has finished */
        writestream.on('error', onerror); /* Oops! */
      });
    }

    new Entry({
      user: req.body._id /** ¡IMPORTATE! PROVISORIO DEBE CAMBIAR POR REQ.SESSION.USER._ID */ ,
      title: req.body.title,
      content: req.body.content /* Markdown text */ ,
      tags: tags /* The previously processed tags array */
    }, function (err, data) {
      if (err) {
        next(err);
      } else {
        entry = data;
        if (req.files && req.files.length) { /* If there are any files, save them */
          savePictures();
        } else { /* If not, just save the entry */
          saveEntry();
        }
      }
    });

  });


  /**
   * Get entries base on tags 
   + Only works for a perfect match
   */
  router.get('/tags', function (req, res, next) {

    var tags = req.query.tags;

    /** 
     * Finds entries related with tags
     */
    function findEntries() {
      Entry.find()
        .where('tags', tags)
        .populate('tags')
        .exec(function (err, entries) {
          if (err) {
            next(err);
          } else if (entries && entries.length) {
            res.send(entries);
          } else {
            res.status(404).end();
          }
        });
    }

    /* Convert the tags string to array if necessary */
    if (typeof tags === 'string') {
      tags = [tags];
    }

    /* Check if there are entries-based-on-tags to find */
    if (Array.isArray(tags) && tags.length) {
      findEntries();
    } else {
      res.status(400).end();
    }

  });

  /**
   * Get entries base on tags
   * Returns every entry which contains any of the tags
   */
  router.get('/tags/any', function (req, res, next) {
    var tags = req.query.tags;

    function findEntries() {
      Entry
        .find({
          tags: {
            $in: tags
          }
        })
        .populate('tags')
        .exec(function (err, entries) {
          if (err) {
            next(err);
          } else if (entries && entries.length) {
            res.send(entries);
          } else {
            res.status(404).end();
          }
        });
    }

    /* Convert the tags string to array if necessary */
    if (typeof tags === 'string') {
      tags = [tags];
    }

    /* Check if there are entries to find */
    if (Array.isArray(tags) && tags.length) {
      findEntries();
    } else {
      res.status(400).end();
    }
  });

  /**
   * Get an entry
   */
  router.get('/:id', function (req, res, next) {
    Entry.findById(req.params.id)
      .deepPopulate('tags pictures user.state user.profile') /* Retrieves data of linked schemas */
      .exec(function (err, entry) {
        if (err) {
          next(err);
        } else if (entry) {
          res.send(entry);
        } else {
          res.status(400).end();
        }
      });
  });

  /**
   * Get entries of an user
   */
  router.get('/user/:id', function (req, res, next) {
    Entry.find()
      .where('user', req.params.id)
      .deepPopulate('tags pictures user.state user.profile') /* Retrieves data of linked schemas */
      .exec(function (err, entries) {
        if (err) {
          next(err);
        } else if (entries && entries.length) {
          res.send(entries);
        } else {
          res.status(400).end();
        }
      });
  });

};