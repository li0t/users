'use strict';

var debug = require('debug')('app:api:tasks');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Task = mongoose.model('task');
  var Tag = mongoose.model('tag');

  /**
   * Get session user tasks
   */
  router.get('/', function(req, res, next) {

    var i;

    Task.find().

    where('creator', req.session.user._id).
    where('collaborators.user').ne(req.session.user._id).
    where('deleted', null).

    deepPopulate('group.profile creator.profile collaborators entries priority').

    sort('-created').

    exec(function(err, tasks) {
      if (err) {
        return next(err);
      }

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

    });

  });

  /**
   * Get tasks by keywords
   */
  router.get('/like*', function(req, res, next) {

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

    Task.find(find, score).

    sort('created').
    sort(score).

    skip(skip).
    limit(limit).

    populate('group').

    exec(function(err, tasks) {
      if (err) {
        return next(err);
      }

      res.send(tasks);

    });
  });

  /**
   * Create a new task
   */
  router.post('/', function(req, res, next) {

    var dateTime = req.body.dateTime || null;
    var creator = req.session.user._id;
    var group = req.body.group;

    relations.membership(group, function(err, membership) {

      if (err || !membership.group) {
        debug('Group %s not found', req.body.group);
        return res.sendStatus(400);
      }

      group = membership.group; /** The group model */

      if (!membership.isMember(creator)) {
        debug('User is not part of group %s', creator, group._id);
        return res.sendStatus(403);
      }

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
          return next(err);
        }

        debug('Task %s created', task._id);
        res.status(201).send(task._id);

      });
    });

  });

  /**
   * Add Tags to a Task
   */
  router.post('/:id/tags', function(req, res, next) {

    var user = req.session.user._id;
    var tags = req.body.tags;
    var tagsSaved = 0;
    var task;

    /* Check if all tags were found and/or created */
    function onTagReady(tag) {

      task.tags.push(tag.name);

      tagsSaved += 1;

      if (tagsSaved === req.body.tags.length) {
        task.save(function(err) {
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

    Task.findById(req.params.id).

    exec(function(err, data) {
      if (err) {
        return next(err);
      }

      if (!data) {
        return res.sendStatus(404);
      }

      task = data;

      tags = tags.filter(function(tag) {
        return task.tags.indexOf(tag) < 0;
      });

      relations.membership(task.group, function(err, membership) {

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
   * Get tasks of a group
   */
  router.get('/of-group/:id', function(req, res, next) {

    var i;
    var user = req.session.user._id;
    var group = req.params.id;

    relations.membership(group, function(err, relation) {

      if (err || !relation.group) {
        debug('Group  %s was not found', group);
        return res.sendStatus(404);
      }

      if (!relation.isMember(user)) {
        debug('User %s is not part of group %s', req.session.user._id, group);
        return res.sendStatus(403);
      }

      Task.find().

      where('group', group).
      where('deleted', null).

      sort('-created').

      deepPopulate('priority').

      exec(function(err, tasks) {

        if (err) {
          return next(err);
        }

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

      });
    });

  });

  /**
   * Set task as completed
   */
  router.put('/close/:id', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      if (!task.completed) {
        debug('Task %s is already open', task._id);
        return res.sendStatus(403);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

        task.completed = new Date();

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s is now set as completed', task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Set task as deleted
   */
  router.delete('/:id', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

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

        task.deleted = new Date();

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s is now set as disabled', task._id);
          res.end();

        });

      });
    });

  });

  /**
   * Re-open task
   */
  router.put('/re-open/:id', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      if (!task.completed) {
        debug('Task %s is already open', task._id);
        return res.sendStatus(400);
      }

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

        task.completed = null;

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s was reopened', task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Edit task objective
   */
  router.put('/:id/objective', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

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

        task.objective = req.body.objective || task.objective;

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s objective changed to %s', task._id, task.objective);
          res.end();

        });
      });
    });

  });

  /**
   * Edit task priority
   */
  router.put('/:id/priority', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

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

        task.priority = req.body.priority || task.priority;

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Task %s priority changed to %s', task._id, task.priority);
          res.end();

        });
      });
    });

  });

  /**
   * Set task datetime
   */
  router.put('/:id/date-time', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

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

        task.dateTime = req.body.dateTime;

        task.save(function(err) {
          if (err) {
            if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
              res.sendStatus(400);
            } else {
              next(err);
            }
            return;
          }

          debug('Task %s dateTime was set to %s', task._id, task.dateTime);
          res.end();

        });
      });
    });

  });


  /**
   * Add task worked time
   */
  router.put('/:id/worked-time', function(req, res, next) {

    var task = req.params.id;
    var collaborator = req.session.user._id;

    relations.collaboration(task, function(err, relation) {

      /** Check if task exists and is available for changes */
      if (err || !relation.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = relation.task; /** The task model */

      if (task.completed) {
        debug('Task %s is completed, no changes allowed', task._id);
        return res.sendStatus(403);
      }

      collaborator = relation.isCollaborator(collaborator);

      if (!collaborator) {
        debug('User %s is not collaborator in task %s', req.session.user._id, task._id);
        return res.sendStatus(403);
      }

      task.collaborators[collaborator.index].workedTimes.push(new Date());

      task.save(function(err) {
        if (err) {
          return next(err);
        }

        res.end();

      });
    });

  });

  /**
   * Get a task
   **/
  router.get('/:id', function(req, res, next) {

    var i;
    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not allowed to modify task %s', user, task._id);
          return res.sendStatus(403);
        }

        for (i = 0; i < task.collaborators.length; i++) {
          /** Check if user is actual collaborator of task */
          if (task.collaborators[i].left.length && (task.collaborators[i].left.length === task.collaborators[i].joined.length)) {
            /** Remove it from the array and reallocate index */
            task.collaborators.splice(i, 1);
            i -= 1;
          }
        }

        task.deepPopulate('group.profile collaborators.user entries.entry priority notes', function(err, task) {
          if (err) {
            return next(err);
          }

          res.send(task);

        });
      });
    });

  });

};
