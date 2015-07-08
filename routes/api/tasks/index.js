/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:tasks');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var Task = mongoose.model('task');

  /**
   * Create a new task
   */
  router.post('/', function(req, res, next) {

    var group = req.body.group;
    var dateTime = req.body.dateTime || null;
    var creator = req.session.user._id;
    var priorities = statics.models.priority;
    var _priority;
    var priority = null;

    relations.membership(group, function(membership) {

      group = membership.group; /** The group model */

      if (group) {

        if (membership.isMember(creator)) {

          for (_priority in priorities) { /** Search the priority id and check that exists */

            if (priorities.hasOwnProperty(_priority)) {

              if (JSON.stringify(priorities[_priority]._id) === JSON.stringify(req.body.priority)) {

                priority = req.body.priority;
                break;

              }
            }
          }

          if (priority) {

            new Task({
              group: group._id,
              creator: creator,
              objective: req.body.objective,
              priority: req.body.priority,
              dateTime: dateTime,
              notes: req.body.notes,
            }).

            save(function(err, task) {

              if (err) {

                if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
                  res.status(400).send(err);
                } else {
                  next(err);
                }

              } else {

                debug('Task %s created', task._id);
                res.status(201).send(task._id);

              }
            });
          } else {
            res.status(400).send('You must set a valid priority');
          }
        } else {
          debug('User is not part of group %s', creator, group._id);
          res.sendStatus(403);
        }
      } else {
        debug('Group %s not found', req.body.group);
        res.status(404).send('group not found');
      }
    });

  });

  /**
   * Get session user tasks
   */
  router.get('/me', function(req, res, next) {

    var i;

    Task.

    find().

    where('creator', req.session.user._id).

    where('deleted', null).

    populate('group collaborators entries priority').

    sort('-created').

    exec(function(err, tasks) {

      if (err) {
        next(err);

      } else {

        tasks.forEach(function(task) {

          for (i = 0; i < task.collaborators.length; i++) {

            if (task.collaborators[i].left.length && (task.collaborators[i].left.length > task.collaborators[i].joined.length)) {

              task.collaborators.splice(i, 1);

            }
          }
        });

        res.send(tasks);

      }
    });

  });

  /**
   * Get tasks of a group
   */
  router.get('/group/:id', function(req, res, next) {

    var i;
    var user = req.session.user._id;
    var group = req.params.id;

    relations.membership(group, function(relation) {

      if (relation.group) {

        if (relation.isMember(user)) {

          Task.

          find().

          where('group', group).

          where('deleted', null).

          sort('-created').

          deepPopulate('priority').

          exec(function(err, tasks) {

            if (err) {
              next(err);

            } else {

              tasks.forEach(function(task) {

                for (i = 0; i < task.collaborators.length; i++) {
                  /** Check if user is actual collaborator of task */
                  if (task.collaborators[i].left.length && (task.collaborators[i].left.length === task.collaborators[i].joined.length)) {
                    /** Remove it from the array and reallocate index */
                    task.collaborators.splice(i, 1);
                    i -= 1;
                  }
                }
              });

              res.send(tasks);

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
   * Set task as completed
   */
  router.put('/:id/complete', function(req, res, next) { /** TODO: implement this change as a date field  */

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (!task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              task.completed = new Date();

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('Task %s is now set as completed', task._id);
                  res.send('Task ' + task._id + ' is now set as completed');

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

  });

  /**
   * Set task as deleted
   */
  router.delete('/:id', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (!task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              task.deleted = new Date();

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('Task %s is now set as disabled', task._id);
                  res.send('Task ' + task._id + ' was deleted');

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

  });

  /**
   * Re-open task
   */
  router.put('/:id/re-open', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              task.completed = null;

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('Task %s was reopened', task._id);
                  res.send('Task ' + task._id + ' was reopened');

                }
              });
            } else {
              debug('User %s is not allowed to modify task %s', user, task._id);
              res.sendStatus(403);
            }
          });
        } else {
          debug('Task %s is not completed', user);
          res.sendStatus(403);
        }
      } else {
        debug('Task %s was not found', req.params.id);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Edit task objective
   */
  router.post('/:id/objective', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (!task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              task.objective = req.body.objective || task.objective;

              task.save(function(err) {

                if (err) {
                  next(err);

                } else {
                  debug('Task %s objective changed to %s', task._id, task.objective);
                  res.send('Task ' + task._id + ' objective changed to ' + task.objective);

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

  });

  /**
   * Edit task priority
   */
  router.post('/:id/priority', function(req, res, next) { /** TODO: move static validation to schema */

    var task = req.params.id;
    var user = req.session.user._id;
    var priorities = statics.models.priority;
    var priority = null;
    var _priority;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (!task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              if (req.body.priority) {

                for (_priority in priorities) { /** Search the priority id and check that exists */

                  if (priorities.hasOwnProperty(_priority)) {

                    if (JSON.stringify(priorities[_priority]._id) === JSON.stringify(req.body.priority)) {

                      priority = req.body.priority;
                      break;

                    }
                  }
                }
              }

              task.priority = priority || task.priority;

              task.save(function(err) {

                if (err) {
                  next(err);

                } else {
                  debug('Task %s priority changed to %s', task._id, task.priority);
                  res.send('Task ' + task._id + ' priority changed to ' + task.priority);

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

  });

  /**
   * Set task datetime
   */
  router.post('/:id/date-time', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (!task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              task.dateTime = req.body.dateTime;

              task.save(function(err) {

                if (err) {

                  if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
                    res.status(400).send(err);
                  } else {
                    next(err);
                  }

                } else {
                  debug('Task %s dateTime was set to %s', task._id, task.dateTime);
                  res.send('Task ' + task._id + ' dateTime was set to ' + task.dateTime);

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

  });

  /**
   * Get a task
   **/
  router.get('/:id', function(req, res, next) {

    var i;
    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

            task.deepPopulate('group.profile collaborators.user entries.entry priority notes', function(err, task) {

              if (err) {
                next(err);
              } else {

                for (i = 0; i < task.collaborators.length; i++) {
                  /** Check if user is actual collaborator of task */
                  if (task.collaborators[i].left.length && (task.collaborators[i].left.length === task.collaborators[i].joined.length)) {
                    /** Remove it from the array and reallocate index */
                    task.collaborators.splice(i, 1);
                    i -= 1;
                  }
                }

                res.send(task);
              }

            });
          } else {
            debug('User %s is not allowed to modify task %s', user, task._id);
            res.sendStatus(403);
          }
        });
      } else {
        debug('Task %s was not found', req.params.id);
        res.sendStatus(404);
      }
    });

  });

};
