/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
  debug = require('debug')('app:api:groups:entries');

var relations = component('relations'),
  statics = component('statics'),
  gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');
  var Tag = mongoose.model('tag');
  var Task = mongoose.model('task');

  /**
   * Create a new entry
   */
  router.post('/create', function(req, res, next) { /** TODO: always create to group */

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
        Tag.findOne()
          .where('name', tag)
          .exec(function(err, found) {
            if (err) {
              debug('Error! : %s', err);
            } else if (found) {
              debug('Tag found : %s', found.name);
              onTagReady(found);
            } else {
              debug('Creating new Tag : %s', tag);
              new Tag({
                name: tag
              }).save(function(err, newTag) {
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

    function createEntry() {

      new Entry({
        user: req.session.user._id,
        group: group,
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

    }

    if (group) {

      relations.membership(group, function(relation) { /** Get the group model */

        if (relation.group) {

          if (relation.isMember(req.session.user._id)) {

            createEntry();

          } else {
            debug('User %s is not part of group %s', req.session.user._id, group);
            res.sendStatus(403);
          }
        } else {
          res.status(404).send('No group found with id ' + group);
        }
      });
    } else {
      createEntry();
    }

  });

  /**
   * Get entries of a group
   */
  router.get('/group/:id/entries', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;

    relations.membership(group, function(relation) {

      if (relation.group) {

        if (relation.isMember(user)) {

          Entry.

          find().

          where('group', group).

          populate('pictures'). /* Retrieves data from linked schemas */

          sort('-created').

          exec(function(err, entries) {

            if (err) {
              next(err);

            } else {

              res.send(entries);

            }
          });
        } else {
          debug('User %s is not part of group %s', req.session.user._id, group);
          res.sendStatus(403);
        }
      } else {
        debug('Group  %s was not found', group);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get entries with files of a group
   */
  router.get('/group/:id/entries-with-files', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;

    relations.membership(group, function(relation) {

      if (relation.group) {

        if (relation.isMember(user)) {

          Entry.

          find({
            $where: 'this.pictures.length > 0'
          }).

          where('group', group).

          populate('pictures'). /* Retrieves data from linked schemas */

          sort('-created').

          exec(function(err, entries) {

            if (err) {
              next(err);

            } else {

              res.send(entries);

            }
          });
        } else {
          debug('User %s is not part of group %s', req.session.user._id, group);
          res.sendStatus(403);
        }
      } else {
        debug('Group  %s was not found', group);
        res.sendStatus(404);
      }
    });

  });

};
