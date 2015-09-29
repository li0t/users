'use strict';

var debug = require('debug')('app:api:tasks:activities');

var relations = component('relations');

module.exports = function(router) {

  /**
   * Add activities to a Task.
   *
   * @type Express Middleware.
   */
  router.post('/add-to/:id', function(req, res, next) {

    var activities = req.body.activities;
    var user = req.session.user._id;
    var task = req.params.id;
    var saved = 0;

    if (!activities || !activities.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof activities === 'string') {
      activities = [activities];
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

        activities.forEach(function(activity) {

          if (activity && typeof activity === "string") {

            saved += 1;
            debug('activity -> %s added to task %s', activity, task._id);
            task.activities.push({
              description: activity
            });
          }
        });

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s new activities added to task %s', saved, activities.length, task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Remove activities from Task.
   *
   * @type Express Middleware.
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var activities = req.body.activities;
    var user = req.session.user._id;
    var task = req.params.id;
    var removed = 0;
    var index;
    var i;

    if (!activities || !activities.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof activities === 'string') {
      activities = [activities];
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

        activities.forEach(function(activity) {

          if (activity) {

            index = -1;

            for (i = 0; i < task.activities.length; i++) {

              if (task.activities[i].description === activity) {
                index = i;
                break;
              }
            }

            if (index > -1) {

              removed += 1;
              debug('activity -> %s removed from task %s', activity, task._id);
              task.activities.splice(index, 1);

            } else {
              debug('activity -> %s was not found in task %s', activity, task._id);
            }

            task.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('%s of %s activities removed from task %s', removed, activities.length, task._id);
              res.end();

            });
          }
        });
      });
    });

  });

  /**
   * Set activities of a Task as checked.
   *
   * @type Express Middleware.
   */
  router.put('/of/:id/check', function(req, res, next) {

    var activities = req.body.activities;
    var user = req.session.user._id;
    var i, task = req.params.id;
    var now = new Date();

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      if (task.completed) {
        debug('Task %s is already closed', task._id);
        return res.sendStatus(403);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

        activities.forEach(function(activity) {

          for (i = 0; i < task.activities.length; i++) {
            if (task.activities[i].description === activity) {
              task.activities[i].checked = now;
              break;
            }
          }

        });

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s activities checked', task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Set activities of a Task as not-checked.
   *
   * @type Express Middleware.
   */
  router.put('/of/:id/uncheck', function(req, res, next) {

    var activities = req.body.activities;
    var user = req.session.user._id;
    var i, task = req.params.id;

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      if (task.completed) {
        debug('Task %s is already closed', task._id);
        return res.sendStatus(403);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

        activities.forEach(function(activity) {

          for (i = 0; i < task.activities.length; i++) {
            if (task.activities[i].description === activity) {
              task.activities[i].checked = null;
              break;
            }
          }

        });

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s activities unchecked', task._id);
          res.end();

        });
      });
    });

  });

};
