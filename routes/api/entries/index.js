/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:entries');

var relations = component('relations');
var statics = component('statics');
var gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');
  var Tag = mongoose.model('tag');
  var Task = mongoose.model('task');

  /**
   * Create a new entry
   */
  router.post('/create', function(req, res, next) { /** TODO: always create without group */

    var entry; /* This is the target schema */
    var group = req.body.group || null;
    var tagsSaved = 0;

    /**
     * Save the document
     */
    function saveEntry() {
      entry.save(function(err, entry) {
        if (err) {
          next(err);
        } else {
          res.status(201).send(entry._id);
        }
      });
    }

    /**
     * Lookup for tags provided by the user
     * If one is not found create a new tag
     */
    function saveTags() {

      /* Check if all tags were found and/or created */
      function onTagReady(tag) {
        entry.tags.push(tag.name);

        tagsSaved += 1;

        if (tagsSaved === req.body.tags.length) {
          saveEntry();
        }
      }

      /* Convert the tags string to array if necessary */
      if (typeof req.body.tags === 'string') {
        req.body.tags = [req.body.tags];
      }
      req.body.tags.forEach(function(tag) {

        Tag.findOne().
        where('name', tag).
        exec(function(err, found) {
          if (err) {
            debug('Error! : %s', err);

          } else if (found) {
            debug('Tag found : %s', found.name);
            onTagReady(found);

          } else {
            debug('Creating new Tag : %s', tag);
            new Tag({
              name: tag
            }).
            save(function(err, newTag) {
              if (err) {
                debug('Error! : %s', err);
              } else {
                onTagReady(newTag);
              }
            });
          }
        });
      });
    }

    new Entry({
      user: req.session.user._id,
      title: req.body.title,
      content: req.body.content /* Markdown text */
    }).

    save(function(err, data) {
      if (err) {
        if (err.name && (err.name === 'CastError') || (err.name === 'ValidationError')) {
          res.sendStatus(400);
        } else {
          next(err);
        }
      } else {

        entry = data;

        if (req.body.tags && req.body.tags.length) { /* If there are any tags, save them */
          saveTags();

        } else { /* If not, just save the entry */
          saveEntry();

        }
      }
    });


  });

  /**
   * Upload pictures to an entry
   */
  router.post('/:id/pictures', function(req, res, next) {

    var entry; /* This is the target schema */
    var picturesSaved = 0;

    /**
     * Save the document
     */
    function saveEntry() {
      entry.save(function(err, entry) {
        if (err) {
          next(err);
        } else {
          debug('%s pictures saved to entry %s', picturesSaved, entry._id);
          res.send(picturesSaved + ' pictures save to entry ' + entry._id);
        }
      });
    }

    /**
     * Save pictures with gridfs and store de ids
     */
    function savePictures() {

      function onclose(fsFile) {
        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        entry.pictures.push(fsFile._id);

        picturesSaved += 1;

        /* Check if all pictures were streamed to the database */
        if (picturesSaved === req.files.length) {
          debug('All files saved');
          saveEntry();
        }
      }

      function onerror(err) {
        debug('Error streaming file!');
        next(err);
      }

      req.files.forEach(function(file) {
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

    Entry.findOne().

    where('_id', req.params.id).
    where('user', req.session.user._id).

    exec(function(err, data) {
      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (data) {

        entry = data;

        if (req.files && req.files.length) { /* If there are any files, save them */
          savePictures();
        } else { /* If not, just save the document */
          saveEntry();
        }

      } else {
        debug('Entry %s was not found', req.params.id);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get an entry
   */
  router.get('/:id', function(req, res, next) {

    var user = req.session.user._id;
    var entry;

    function checkByContact() {

      relations.contact(user, function(err, relation) {

        if ((!err && relation.isContact(entry.user)) || JSON.stringify(entry.user) === JSON.stringify(user)) {

          res.send(entry);

        } else {

          debug('User %s and %s are not contacts with each other', entry.user, user);
          res.sendStatus(403);
        }
      });

    }

    Entry.

    findById(req.params.id).

    populate('pictures'). /* Retrieves data from linked schemas */

    exec(function(err, found) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (found) {
        entry = found;

        if (entry.group) {

          relations.membership(entry.group, function(err, relation) {

            if (!err && relation.group && relation.isMember(user)) {
              res.send(entry);

            } else {
              checkByContact();

            }
          });
        } else {
          checkByContact();

        }
      } else {
        res.sendStatus(404);
      }
    });

  });

};
