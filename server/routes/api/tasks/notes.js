'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:tasks:notes');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var Task = mongoose.model('task');

  /**
   * Add notes to a task
   */
  router.post('/:id/add', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;
    var notes = req.body.notes;
    var saved = 0;
    var now = new Date();

    if (notes && notes.length) {

      /** Prevent a mistype error */
      if (typeof notes === 'string') {
        notes = [notes];
      }

      relations.collaboration(task, function(err, collaboration) {

        /** Check if task exists and is available for changes */
        if (!err && collaboration.task) {

        task = collaboration.task; /** The task model */

          if (!task.completed) {

            relations.membership(task.group, function(err, taskGroup) {

              if (!err && taskGroup.group && taskGroup.isMember(user)) { /** Check if user is part of the task group */

                notes.forEach(function(note) {

                  if (note && typeof note === "string") {

                    saved += 1;
                    debug('Note -> %s added to task %s', note, task._id);
                    task.notes.push({
                      note: note,
                      added: now
                    });

                  }

                });

                task.save(function(err) {
                  if (err) {
                    next(err);
                  } else {

                    debug('%s of %s new notes added to task %s', saved, notes.length, task._id);
                    res.send(saved + ' of ' + notes.length + ' new notes added to task ' + task._id);

                  }
                });
              } else {
                debug('User %s is not allowed to modify task %s', user, task._id);
                res.sendStatus(403);
              }
            });
          } else {
            debug('Task %s is completed, no changes allowed', task._id);
            res.sendStatus(403);
          }
        } else {
          debug('Task %s was not found', req.params.id);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Remove notes from task
   */
  router.post('/:id/remove', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;
    var notes = req.body.notes;
    var removed = 0;
    var i;
    var index;

    if (notes && notes.length) {

      /** Prevent a mistype error */
      if (typeof notes === 'string') {
        notes = [notes];
      }

      relations.collaboration(task, function(err, collaboration) {

        /** Check if task exists and is available for changes */
        if (!err && collaboration.task) {

        task = collaboration.task; /** The task model */

          if (!task.completed) {

            relations.membership(task.group, function(err, taskGroup) {

              if (!err && taskGroup.group && taskGroup.isMember(user)) { /** Check if user is part of the task group */

                notes.forEach(function(note) {

                  if (note) {

                    index = -1;

                    for (i = 0; i < task.notes.length; i++) {

                      if (task.notes[i].note === note) {
                        index = i;
                        break;
                      }
                    }

                    if (index > -1) {

                      removed += 1;
                      debug('Note -> %s removed from task %s', note, task._id);
                      task.notes.splice(index, 1);

                    } else {
                      debug('Note -> %s was not found in task %s', note, task._id);
                    }

                    task.save(function(err) {
                      if (err) {
                        next(err);
                      } else {

                        debug('%s of %s notes removed from task %s', removed, notes.length, task._id);
                        res.send(removed + ' of ' + notes.length + ' notes removed from task ' + task._id);

                      }
                    });
                  }
                });
              } else {
                debug('User %s is not allowed to modify task %s', user, task._id);
                res.sendStatus(403);
              }
            });
          } else {
            debug('Task %s is completed, no changes allowed', task._id);
            res.sendStatus(403);
          }
        } else {
          debug('Task %s was not found', req.params.id);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

};
