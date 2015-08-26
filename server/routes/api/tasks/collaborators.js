'use strict';

var debug = require('debug')('app:api:tasks:collaborators');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Task = mongoose.model('task');

  /**
   * Get tasks where session user is collaborator
   */
  router.get('/me', function(req, res, next) {

    var user = req.session.user._id;
    var i, j;

    Task.find().

    where('collaborators.user', user).
    where('deleted', null).

    deepPopulate('group.profile creator.profile collaborators.user entries priority').

    sort('-created').

    exec(function(err, tasks) {
      if (err) {
        return next(err);
      }

      for (i = 0; i < tasks.length; i++) {

        for (j = 0; j < tasks[i].collaborators.length; j++) {

          if (JSON.stringify(tasks[i].collaborators[j].user._id) === JSON.stringify(user)) {

            if (tasks[i].collaborators[j].left.length && (tasks[i].collaborators[j].left.length === tasks[i].collaborators[j].joined.length)) {
              /** Remove it from the array and reallocate index */
              tasks.splice(i, 1);
              i -= 1;

              /* Check if user is currently working on task */
            } else {

              tasks[i] = tasks[i].toObject();
              tasks[i].isCollaborator = true;

              if (tasks[i].collaborators[j].workedTimes.length % 2 !== 0) {
                tasks[i].isWorking = true;
              }
            }
            break;
          }
        }
      }

      res.send(tasks);

    });

  });

  /**
   * Get tasks where session user is currently working
   */
  router.get('/me/working', function(req, res, next) {

    var user = req.session.user._id;
    var tasks = [];
    var i, j;

    Task.find().

    where('collaborators.user', user).
    where('completed', null).
    where('deleted', null).

    exec(function(err, found) {
      if (err) {
        return next(err);
      }

      for (i = 0; i < found.length; i++) {

        for (j = 0; j < found[i].collaborators.length; j++) {

          if (JSON.stringify(found[i].collaborators[j].user) === JSON.stringify(user)) {

            if (!found[i].collaborators[j].left.length || (found[i].collaborators[j].joined.length > found[i].collaborators[j].left.length)) {

              if (found[i].collaborators[j].workedTimes.length % 2 !== 0) {

                tasks.push(found[i]._id);

              }
            }
            break;
          }
        }
      }

      res.send(tasks);

    });

  });

  /**
   * Add collaborators to a task
   */
  router.post('/add-to/:id', function(req, res, next) {

    var collaborators = req.body.collaborators;
    var inviter = req.session.user._id;
    var task = req.params.id;
    var now = new Date();
    var wasCollaborator;
    var saved = 0;

    if (!collaborators || !collaborators.length) {
      return res.sendStatus(400);
    }
    /** Prevent a mistype error */
    if (typeof collaborators === 'string') {
      collaborators = [collaborators];
    }

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

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(inviter)) {
          debug('User is not part of task group %s', inviter, task.group);
          return res.sendStatus(403);
        }

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
            return next(err);
          }

          debug('%s of %s new collaborators added to task %s', saved, collaborators.length, task._id);
          res.end();

        });
      });
    });

  });

  /**
   * Remove collaborators from task
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var collaborators = req.body.collaborators;
    var remover = req.session.user._id;
    var task = req.params.id;
    var now = new Date();
    var collaborator;
    var removed = 0;

    if (!collaborators || !collaborators.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof collaborators === 'string') {
      collaborators = [collaborators];
    }

    relations.collaboration(task, function(err, relation) {

      /** Check if task exists and is available for changes */
      if (err || !relation.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      /** The task model */
      task = relation.task;

      if (task.completed) {
        debug('Task %s is completed, no changes allowed', task._id);
        return res.sendStatus(403);
      }

      relations.membership(task.group, function(err, taskGroup) {

        /** Check if remover is part of the task group */
        if (err || !taskGroup.group || !taskGroup.isMember(remover)) {
          debug('User %s is not part of task %s group', remover, task.group);
          return res.sendStatus(403);
        }

        collaborators.forEach(function(_collaborator) {

          collaborator = relation.isCollaborator(_collaborator);

          /** Check if user is a task collaborator */
          if (collaborator) {

            removed += 1;
            debug('Collaborator %s removed from task %s', _collaborator, task._id);
            task.collaborators[collaborator.index].left.push(now); /** Add one left instance for task collaborator */

          } else {
            debug('User %s is not collaborator of task %s', _collaborator, task._id);
          }
        });

        task.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s collaborators removed from task %s', removed, collaborators.length, task._id);
          res.end();

        });
      });
    });

  });

};
