'use strict';

var debug = require('debug')('app:api:entries:tasks');

var relations = component('relations');


module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');
  var Task = mongoose.model('task');

  /**
   * Add entries to a task
   */
  router.post('/add-to/:id', function(req, res, next) {

    var user = req.session.user._id;
    var entries = req.body.entries;
    var task = req.params.id;
    var now = new Date();
    var checked = 0;
    var saved = 0;
    var i;

    function checkAndSave() {

      if (checked === entries.length) {
        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s new entries added to task %s', saved, entries.length, task._id);
          res.end();

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

      return present;
    }

    if (!entries || !entries.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof entries === 'string') {
      entries = [entries];
    }

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if remover is part of the task group */
          debug('User %s is not part of task %s group', user, task.group);
          return res.sendStatus(403);
        }

        relations.contact(user, function(err, relation) {

          entries.forEach(function(entry) {

            Entry.findById(entry, function(err, _entry) {

              checked += 1;

              if (err) {
                debug(err);

              } else if (_entry) {

                /** Check if user is contact of entry creator or is itself */
                if ((!err && relation.isContact(_entry.user)) || JSON.stringify(user) === JSON.stringify(_entry.user)) {

                  if (!isPresent(entry)) {

                    saved += 1;
                    debug('Entry %s saved into task %s', entry, task._id);
                    task.entries.push({
                      entry: entry,
                      added: now
                    });

                  } else {
                    debug('Entry %s is already in task %s entries', entry, task._id);
                  }

                } else if (_entry.group) {

                  checked -= 1; /** Wait for asynchronous method to check this entry */

                  relations.membership(_entry.group, function(err, entryGroup) {

                    if (!err && entryGroup.group && entryGroup.isMember(user)) { /** Check if user is part of entry group */

                      if (!isPresent(entry)) {

                        saved += 1;
                        debug('Entry %s saved into task %s', entry, task._id);
                        task.entries.push({
                          entry: entry,
                          added: now
                        });

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
      });
    });

  });

  /**
   * Remove entries from task
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var remover = req.session.user._id;
    var entries = req.body.entries;
    var task = req.params.id;
    var removed = 0;
    var index;
    var i;

    if (!entries || !entries.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof entries === 'string') {
      entries = [entries];
    }

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(remover)) { /** Check if remover is part of the task group */
          debug('User %s is not part of task %s group', remover, task.group);
          return res.sendStatus(403);
        }

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
            return next(err);
          }

          debug('%s of %s entries removed from task %s', removed, entries.length, task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Get task entries
   */
  router.get('/:id', function(req, res, next) {

    var user = req.session.user._id;

    Task.findById(req.params.id).

    deepPopulate('group.profile entries.user entries.pictures entries.documents').

    sort('-_id').

    exec(function(err, task) {
      if (err) {
        return next(err);
      }

      if (!task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to get information about task %s', user, task._id);
          return res.sendStatus(403);
        }

        res.send(task.entries);

      });
    });

  });

};
