'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:tasks:collaborators');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var Task = mongoose.model('task');

  /**
   * Get tasks where session user is collaborator
   */
  router.get('/me', function(req, res, next) {

    var user = req.session.user._id;
    var tasks = [];
    var i;
    var isCollaborator;

    Task.

    find().

    where('collaborators.user', user).

    where('deleted', null).

    populate('group collaborators.user entries priority').

    sort('-created').

    exec(function(err, found) {

      if (err) {
        next(err);

      } else {

        found.forEach(function(task) {

          isCollaborator = false;

          for (i = 0; i < task.collaborators.length; i++) {

            if (JSON.stringify(task.collaborators[i].user._id) === JSON.stringify(user)) {

              if (!task.collaborators[i].left.length || (task.collaborators[i].left.length < task.collaborators[i].joined.length)) {

                isCollaborator = true;
                break;

              }
            }
          }

          if (isCollaborator) {

            tasks.push(task);

          }
        });

        res.send(tasks);

      }
    });

  });

  /**
   * Add collaborators to a task
   */
  router.post('/:id/add', function(req, res, next) {

    var task = req.params.id;
    var inviter = req.session.user._id;
    var collaborators = req.body.collaborators;
    var saved = 0;
    var now = new Date();
    var wasCollaborator;

    if (collaborators && collaborators.length) {

      /** Prevent a mistype error */
      if (typeof collaborators === 'string') {
        collaborators = [collaborators];
      }

      relations.collaboration(task, function(err, relation) {

        /** Check if task exists and is available for changes */
        if (!err && relation.task) {

        task = relation.task; /** The task model */

          if (!task.completed) {

            relations.membership(task.group, function(err, taskGroup) {

              if (!err && taskGroup.group && taskGroup.isMember(inviter)) {

                collaborators.forEach(function(collaborator) {

                  if (taskGroup.isMember(collaborator)) {

                    if (!relation.isCollaborator(collaborator)) {

                      wasCollaborator = relation.wasCollaborator(collaborator);

                      if (!wasCollaborator) {

                        debug('New collaborator %s added to task %s', collaborator, task._id);
                        task.collaborators.push({
                          user: collaborator,
                          joined: [now]
                        });
                        saved += 1;

                      } else {

                        debug('Collaborator %s re-joined task %s', collaborator, task._id);
                        task.collaborators[wasCollaborator.index].joined.push(now);
                        saved += 1;

                      }
                    } else {
                      debug('User %s is already collaborating in task %s', collaborator, task._id);
                    }
                  } else {
                    debug('Users %s and %s are not in the same group', inviter, collaborator);
                  }
                });

                task.save(function(err) {
                  if (err) {
                    next(err);
                  } else {

                    debug('%s of %s new collaborators added to task %s', saved, collaborators.length, task._id);
                    res.send(saved + ' of ' + collaborators.length + ' new collaborators added to task ' + task._id);

                  }
                });
              } else {
                debug('User is not part of task group %s', inviter, task.group);
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
   * Remove collaborators from task
   */
  router.post('/:id/remove', function(req, res, next) {

    var removed = 0;
    var remover = req.session.user._id;
    var task = req.params.id;
    var collaborators = req.body.collaborators;
    var collaborator;
    var now = new Date();

    if (collaborators && collaborators.length) {

      /** Prevent a mistype error */
      if (typeof collaborators === 'string') {
        collaborators = [collaborators];
      }

      relations.collaboration(task, function(err, relation) {

        /** Check if task exists and is available for changes */
        if (!err && relation.task) {

        task = relation.task; /** The task model */

          if (!task.completed) {

            relations.membership(task.group, function(err, taskGroup) {

              if (!err && taskGroup.group && taskGroup.isMember(remover)) { /** Check if remover is part of the task group */

                collaborators.forEach(function(_collaborator) {

                  collaborator = relation.isCollaborator(_collaborator);

                  if (collaborator) { /** Check if user is a task collaborator */

                    removed += 1;
                    debug('Collaborator %s removed from task %s', _collaborator, task._id);
                    task.collaborators[collaborator.index].left.push(now); /** Add one left instance for task collaborator */

                  } else {
                    debug('User %s is not collaborator of task %s', _collaborator, task._id);
                  }
                });

                task.save(function(err) {
                  if (err) {
                    next(err);

                  } else {

                    debug('%s of %s collaborators removed from task %s', removed, collaborators.length, task._id);
                    res.send(removed + ' of ' + collaborators.length + ' collaborators removed from task ' + task._id);

                  }
                });
              } else {
                debug('User %s is not part of task %s group', remover, task.group);
                res.sendStatus(403);
              }
            });
          } else {
            debug('Task %s is completed, no changes allowed', task._id);
            res.sendStatus(404);
          }
        } else {
          debug('Task %s was not found', req.params.id);
          res.sendStatus(403);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

};
