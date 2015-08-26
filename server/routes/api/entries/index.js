'use strict';


var debug = require('debug')('app:api:entries');

var relations = component('relations');
var gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');
  var Tag = mongoose.model('tag');

  /**
   * Get entries of session user
   */
  router.get('/', function(req, res, next) {

    Entry.find().

    where('user', req.session.user._id).

    sort('-created').

    exec(function(err, entries) {
      if (err) {
        return next(err);
      }

      res.send(entries);

    });
  });

  /**
   * Get entries by keywords
   */
  router.get('/like', function(req, res, next) {

    var keywords = req.query.keywords;
    var limit = req.query.limit;
    var skip = req.query.skip;

    var score = {
      score: {
        $meta: "textScore"
      }
    };
    var find = {
      $text: {
        $search: keywords
      }
    };

    Entry.find(find, score).

    sort('created').
    sort(score).

    skip(skip).
    limit(limit).

    populate('group').

    exec(function(err, entries) {
      if (err) {
        return next(err);
      }

      res.send(entries);

    });
  });

  /**
   * Create a new entry
   */
  router.post('/', function(req, res, next) {

    var group = req.body.group;

    /** Get the group model */
    relations.membership(group, function(err, relation) {

      if (err || !relation.group) {
        debug('Group %s not found', group);
        return res.sendStatus(400);

      }

      if (!relation.isMember(req.session.user._id)) {
        debug('User %s is not part of group %s', req.session.user._id, group);
        return res.sendStatus(403);
      }

      new Entry({
        user: req.session.user._id,
        content: req.body.content,
        title: req.body.title,
        group: group
      }).

      save(function(err, entry) {
        if (err) {
          if (err.name && (err.name === 'CastError') || (err.name === 'ValidationError')) {
            res.sendStatus(400);
          } else {
            next(err);
          }
          return;
        }

        res.status(201).send(entry._id);

      });
    });

  });

  /**
   * Add Tags to a entry
   */
  router.post('/:id/tags', function(req, res, next) {

    var user = req.session.user._id;
    var tags = req.body.tags;
    var tagsSaved = 0;
    var entry;

    /* Check if all tags were found and/or created */
    function onTagReady(tag) {

      entry.tags.push(tag.name);

      tagsSaved += 1;

      if (tagsSaved === req.body.tags.length) {
        entry.save(function(err) {
          if (err) {
            return next(err);
          }
          res.sendStatus(204);

        });
      }
    }

    if (!tags || !tags.length) {
      return res.sendStatus(400);
    }

    /* Convert the tags string to array if necessary */
    if (typeof req.body.tags === 'string') {
      req.body.tags = [req.body.tags];
    }

    Entry.findById(req.params.id).

    exec(function(err, data) {
      if (err) {
        return next(err);
      }

      if (!data) {
        return res.sendStatus(404);
      }

      entry = data;

      tags = tags.filter(function(tag) {
        return entry.tags.indexOf(tag) < 0;
      });

      relations.membership(entry.group, function(err, membership) {

        if (err || !membership.group) {
          debug('Group %s not found', req.body.group);
          return res.sendStatus(400);
        }

        if (!membership.isMember(user)) {
          debug('User is not part of group %s', user, membership.group._id);
          return res.sendStatus(403);
        }

        tags.forEach(function(tag) {

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
      });
    });

  });

  /**
   * Upload files of a type to an entry
   */
  router.post('/:id/:type', function(req, res, next) {

    var type = req.params.type;
    var entry; /* This is the target schema */
    var filesSaved = 0;

    /**
     * Save the document
     */
    function saveEntry() {
      entry.save(function(err, entry) {
        if (err) {
          return next(err);
        }

        debug('%s files saved to entry %s', filesSaved, entry._id);
        res.send(filesSaved + ' files save to entry ' + entry._id);

      });
    }

    /**
     * Save files with gridfs and store de ids
     */
    function saveFiles() {

      function onclose(fsFile) {
        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        entry[type].push(fsFile._id);

        filesSaved += 1;

        /* Check if all files were streamed to the database */
        if (filesSaved === req.files.length) {
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

    Entry.findById(req.params.id).

    exec(function(err, data) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }
        return;
      }

      if (!data) {
        debug('Entry %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      entry = data;

      if (!entry[type]) {
        debug('Type %s is not present in entries', req.params.type);
        res.sendStatus(400);
      }

      if (JSON.stringify(entry.user) !== JSON.stringify(req.session.user._id)) {
        return res.sendStatus(403);
      }

      if (req.files && req.files.length) { /* If there are any files, save them */
        saveFiles();
      } else { /* If not, just save the document */
        saveEntry();
      }
    });

  });

  /**
   * Get an entry
   */
  router.get('/:id', function(req, res, next) {

    var user = req.session.user._id;

    Entry.findById(req.params.id).

    deepPopulate('user.profile group.profile pictures documents audios').

    exec(function(err, entry) {
      if (err) {
        return next(err);
      }

      if (!entry) {
        return res.sendStatus(404);
      }

      relations.membership(entry.group, function(err, membership) {

        if (err || !membership.group) {
          debug('Group %s was not found', membership.group);
          return res.sendStatus(404);
        }

        if (membership.isMember(user)) {
          res.send(entry);

        } else {

          relations.contact(entry.user, function(err, relation) {
            if (err || !relation.contact) {
              return res.sendStatus(400);
            }

            if (!relation.isContact(user)) {
              debug('User %s is not part of group %s and is not contact of entry creator', req.session.user._id, membership.group, entry.user);
              return res.sendStatus(403);
            }

            res.send(entry);

          });
        }
      });
    });

  });

};
