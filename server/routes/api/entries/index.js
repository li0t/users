'use strict';

var debug = require('debug')('app:api:entries');

var relations = component('relations');
var gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');

  /**
   * Get Entries of session User.
   *
   * @type Express Middleware.
   */
  router.get('/', function(req, res, next) {

    Entry.find().

    where('user', req.session.user._id).

    populate('user').
    sort('-_id').

    exec(function(err, entries) {
      if (err) {
        return next(err);
      }

      res.send(entries);

    });

  });

  /**
   * Get Entries by keywords in a query.
   *
   * @type Express Middleware.
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

    sort('-_id').
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
   * Create a new Entry.
   *
   * @type Express Middleware.
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
   * Upload files of a type to an Entry.
   *
   * @type Express Middleware.
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
        res.sendStatus(204);

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
   * Get an Entry.
   *
   * @type Express Middleware.
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
