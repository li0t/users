'use strict';

var debug = require('debug')('app:api:tasks:notes');

var relations = component('relations');

module.exports = function(router /*, mongoose*/ ) {

  /**
   * Add notes to a task
   */
  router.post('/add-to/:id', function(req, res, next) {

    var user = req.session.user._id;
    var notes = req.body.notes;
    var task = req.params.id;
    var now = new Date();
    var saved = 0;

    if (!notes || !notes.length) {
      return res.sendStatus(400);
    }
    /** Prevent a mistype error */
    if (typeof notes === 'string') {
      notes = [notes];
    }

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      if (task.completed) {
        debug('Task %s is completed, no changes allowed', task._id);
        return res.sendStatus(403);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

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
            return next(err);
          }

          debug('%s of %s new notes added to task %s', saved, notes.length, task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Remove notes from task
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var user = req.session.user._id;
    var notes = req.body.notes;
    var task = req.params.id;
    var removed = 0;
    var index;
    var i;

    if (!notes || !notes.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof notes === 'string') {
      notes = [notes];
    }

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      if (task.completed) {
        debug('Task %s is completed, no changes allowed', task._id);
        return res.sendStatus(403);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

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
                return next(err);
              }

              debug('%s of %s notes removed from task %s', removed, notes.length, task._id);
              res.end();

            });
          }
        });
      });
    });

  });

};
