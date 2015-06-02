/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
  debug = require('debug')('app:api:entries');

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
  router.post('/create', function(req, res, next) {

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

    Entry.
    findOne().
    where('_id', req.params.id).
    exec(function(err, data) {
      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (data) {

        entry = data;

        if (JSON.stringify(entry.user) === JSON.stringify(req.session.user._id)) {

          if (req.files && req.files.length) { /* If there are any files, save them */
            savePictures();
          } else { /* If not, just save the document */
            saveEntry();
          }

        } else {
          res.sendStatus(403);
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

    Entry.

    findById(req.params.id).

    populate('pictures'). /* Retrieves data from linked schemas */

    exec(function(err, entry) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (entry) {

        relations.contact(req.session.user._id, function(relation) {

          if (relation.isContact(entry.user) || JSON.stringify(entry.user) === JSON.stringify(req.session.user._id)) {

            res.send(entry);

          } else {
            debug('User %s and %s are not contacts with each other', entry.user, req.session.user._id);
            res.sendStatus(403);
          }
        });
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get entries of an user
   */
  router.get('/user/:id', function(req, res, next) {

    var user = req.params.id;

    relations.contact(user, function(relation) {

      if (relation.contact) {

        if (relation.isContact(req.session.user._id) || user === req.session.user._id) {

          Entry.

          find().

          where('user', user).

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
          debug('User %s and %s are not contacts with each other', user, req.session.user._id);
          res.sendStatus(403);
        }
      } else {
        debug('User %s was not found', user);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get entries with files of an user
   */
  router.get('/user/:id/files', function(req, res, next) {

    var user = req.params.id;

    relations.contact(user, function(relation) {

      if (relation.contact) {

        if (relation.isContact(req.session.user._id) || user === req.session.user._id) {

          Entry.

          find({
            $where: 'this.pictures.length > 0'
          }).

          where('user', user).

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
          debug('User %s and %s are not contacts with each other', user, req.session.user._id);
          res.sendStatus(403);
        }
      } else {
        debug('User %s was not found', user);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get entries of a group
   */
  router.get('/group/:id', function(req, res, next) {

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
  router.get('/group/:id/files', function(req, res, next) {

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

  /**
   * Add entries to a task
   */
  router.post('/task/:taskId/add', function(req, res, next) { /** TODO: prevent duplicated entries */

    var now = new Date();
    var i;
    var task = req.params.taskId;
    var user = req.session.user._id;
    var entries = req.body.entries;
    var checked = 0;
    var saved = 0;

    function checkAndSave() {

      if (checked === entries.length) {

        task.save(function(err) {

          if (err) {
            next(err);
          } else {

            debug('%s of %s new entries added to task %s', saved, entries.length, task._id);
            res.send(saved + ' of ' + entries.length + ' new entries added to task ' + task._id);

          }
        });
      }
    }

    function isPresent(entry) {

      var present = false;

      for (i = 0; i < task.entries.length; i++) {

        if (JSON.stringify(task.entries[i].entry) === JSON.stringify(entry)) {

          present = true;
          break;

        }
      }
    }

    if (entries && entries.length) {

      /** Prevent a mistype error */
      if (typeof entries === 'string') {
        entries = [entries];
      }

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of task group */

              relations.contact(user, function(relation) {

                entries.forEach(function(entry) {

                  Entry.findById(entry, function(err, _entry) {

                    checked += 1;

                    if (err) {
                      debug(err);

                    } else if (_entry) {
                      /** Check if user is contact of entry creator or is itself */
                      if (relation.isContact(_entry.user) || JSON.stringify(user) === JSON.stringify(_entry.user)) {

                        if (!isPresent(entry)) {
                          saved += 1;
                          debug('Entry %s saved into task %s', entry, task._id);
                          task.entries.push({entry: entry, added: now});

                        } else {
                          debug('Entry %s is already in task %s entries', entry, task._id);
                        }

                      } else if (_entry.group) {

                        checked -= 1; /** Wait for asynchronous method to check this entry */

                        relations.membership(_entry.group, function(entryGroup) {

                          if (entryGroup.isMember(user)) { /** Check if user is part of entry group */

                            if (!isPresent(entry)) {

                              saved += 1;
                              debug('Entry %s saved into task %s', entry, task._id);
                              task.entries.push({entry: entry, added: now});

                            } else {
                              debug('Entry %s is already in task %s entries', entry, task._id);
                            }
                          } else {
                            debug('User %s is not part of the entry group %s', user, _entry.group);
                          }

                          checked += 1;
                          checkAndSave();

                        });
                      } else {
                        debug('User %s and the creator of the entry %s are not contacts with each other', user, entry.user);
                      }
                    } else {
                      debug('Entry %s was not found', entry);
                    }

                    checkAndSave();

                  });
                });
              });
            } else {
              debug('User %s is not allowed to modify task %s', user, task._id);
              res.sendStatus(403);
            }
          });
        } else {
          debug('Task %s was not found', req.params.taskId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Remove entries from task
   */
  router.post('/task/:taskId/remove', function(req, res, next) {

    var remover = req.session.user._id;
    var task = req.params.taskId;
    var entries = req.body.entries;
    var i;
    var index;
    var removed = 0;

    if (entries && entries.length) {

      /** Prevent a mistype error */
      if (typeof entries === 'string') {
        entries = [entries];
      }

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(remover)) { /** Check if remover is part of the task group */

              entries.forEach(function(entry) {

                index = -1;

                for (i = 0; i < task.entries.length; i++) {

                  if (JSON.stringify(task.entries[i].entry) === JSON.stringify(entry)) {
                    index = i;
                    break;
                  }
                }

                if (index > -1) {

                  removed += 1;
                  debug('Entry %s removed from task %s', entry, task._id);
                  task.entries.splice(index, 1);

                } else {
                  debug('Entry %s was not found in task %s', entry, task._id);
                }
              });

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('%s of %s entries removed from task %s', removed, entries.length, task._id);
                  res.send(removed + ' of ' + entries.length + ' entries removed from task ' + task._id);

                }
              });
            } else {
              debug('User %s is not part of task %s group', remover, task.group);
              res.sendStatus(403);
            }
          });
        } else {
          debug('Task %s was not found', req.params.taskId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Get task entries
   */
  router.get('/task/:taskId', function(req, res, next) {

    var user = req.session.user._id;

    Task.

    findById(req.params.taskId).

    deepPopulate('group.profile entries.user entries.pictures').

    sort('created').

    exec(function(err, task) {

      if (err) {
        next(err);
      } else if (task) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

            res.send(task.entries);

          } else {
            debug('User %s is not allowed to get information about task %s', user, task._id);
            res.sendStatus(403);
          }
        });
      } else {
        debug('Task %s was not found', req.params.taskId);
        res.sendStatus(404);
      }
    });

  });

};
