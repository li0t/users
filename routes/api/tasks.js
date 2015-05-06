/* jshint node: true */
/* global component */
'use strict';

var //_ = require('underscore'),
debug = require('debug')('app:api:tasks');

var relations = component('relations'),
    statics = component('statics');

module.exports = function (router, mongoose) {

  var Task = mongoose.model('task'),
      Entry = mongoose.model('entry');

  /**
   * Create new task
   */
  router.post('/create', function(req, res, next) {

    var group = req.body.group,
        creator = req.session.user._id,
        priorities = statics.models.priority,
        _priority,
        priority = null;

    relations.membership(group, function(membership) {

      group = membership.group;

      if (group) {

        if (membership.isMember(creator)) { 

          for (_priority in priorities) { /** Search the priority id and check that exists */

            if (priorities.hasOwnProperty(_priority)) {

              if (JSON.stringify(priorities[_priority]._id) === JSON.stringify(req.body.gender)) {

                priority = req.body.gender;
                break;

              }
            }
          }
          
          if (priority) {

            new Task({
              group: group._id,
              creator: creator, 
              status: statics.model('state', 'pending')._id,
              objective: req.body.objective,
              priority: req.body.priority,
              dateTime: req.body.dateTime,
              notes: req.body.notes,
            }).

            save(function(err, task) {

              if( err) {
                if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
                  res.sendStatus(400);
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
        res.sendStatus(404);
      }
    });

  });

  /**
   * Add collaborators to a task
   */
  router.post('/:taskId/addCollaborators', function(req, res, next) {

    var inviter = req.session.user._id,
        collaborators = req.body.collaborators,
        saved = 0;

    Task.findById(req.params.taskId, function(err, task) {

      if (err) {
        if (err.name && (err.name === "CastError" || err.name === "ValidationError")) {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (task) {

        relations.membership(task.group, function(membership) {

          if (membership.isMember(inviter)) { 

            relations.contact(inviter, function(relation) {

              collaborators.forEach(function(collaborator) {

                if (relation.isContact(collaborator)) {
                  task.collaborators.push(collaborator);
                  saved += 1;

                } else {
                  debug('Users %s and %s are not contacts with each other', inviter, user);
                }
              });

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('Pushed %s users of %s', saved, collaborators.length);
                  res.sendStatus(204);

                }
              });
            });
          } else {
            debug('User is not part of group %s', inviter, task.group);
            res.sendStatus(403); 
          }
        });
      } else {
        debug('Task %s not found', req.params.taskId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Remove collaborators from task
   */
  router.post('/:taskId/removeCollaborators', function(req, res, next) { /** Who's allow to do this? */

    var toRemove, removed = 0,
        remover = req.session.user._id, 
        task = req.params.taskId,
        collaborators = req.body.collaborators;

    if (collaborators && collaborators.length) { 

      relations.collaboration(task, function(relation) {

        task = relation.task; /** The task model */

        if (task) { 

          remover = relation.isCreator(remover);

          if (remover) { /** Check if remover is part of the task collaborators array */

            collaborators.forEach(function(collaborator) {

              toRemove = relation.isCollaborator(collaborator);

              if (toRemove) { /** Check if user is part of the task collaborators array */

                removed += 1;
                debug('Collaborator %s removed from task %s' , collaborator, task._id);
                task.collaborators.splice(toRemove.index, 1); /** Remove user from collaborators array */

              } else {
                debug('No user with id %s found in group %s' , req.params.id, req.params.groupId);
              }
            });

            task.save(function(err) {
              if (err) {
                next(err);

              } else {

                debug('%s users removed from task %s' , removed, task._id);
                res.sendStatus(204);

              }
            });
          } else {
            debug('No user with id %s found in task %s' , req.session.user._id, task._id);
            res.sendStatus(403);
          }
        } else {
          debug('No task found with id %s' , req.params.taskId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Get task collaborators
   */
  router.get('/:taskId/collaborators', function(req, res, next) {

    var user = req.session.user._id; 

    Task.

    findById(req.params.groupId).

    deepPopulate('collaborators.profile').

    exec(function(err, task) {

      if (err) {
        next(err);
      } else if (task) {

        relations.membership(task.group, function(membership) {

          if (membership.isMember(user)) {

            res.send(task.collaborators);

          } else {
            debug('User %s is not allow to get information about task %s', user, task._id);
            res.sendStatus(403);
          }
        });
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Add entries to a task
   */
  router.post('/:taskId/addEntries', function(req, res, next) {

    var task = req.params.taskId,
        user = req.session.user._id,
        entries = req.body.entries,
        checked = 0, 
        saved = 0;

    if (entries && entries.length) {

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task;

        if (task) {

          if(collaboration.isCollaborator(user) || collaboration.isCreator(user)) {

            relations.contact(user, function(relation) {

              entries.forEach(function(entry) { 

                Entry.findById(entry, function(err, _entry) {
                  if (err) {
                    debug(err);

                  } else if (_entry) {

                    if (relation.isContact(_entry.user)) {
                      saved += 1;
                      task.entries.push(_entry._id);

                    } else {
                      debug('Users %s and %s are not contacts with each other', user, _entry.user);
                    }
                  } else {
                    debug('Entry %s was no found', entry);
                  }

                  checked += 1;
                  if (checked === entries.length) {

                    task.save(function(err) {
                      if (err) {
                        next(err);
                      } else {

                        debug('%s new entries saved into task %s', saved, task._id);
                        res.sendStatus(204);

                      }
                    });
                  }
                });
              });
            });
          } else {
            debug('User %s is not allow to modify task %s', user, task._id);
            res.sendStatus(403);
          } 
        } else {
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
  router.post('/:taskId/removeEntries', function(req, res, next) {

    var user = req.session.user._id,
        task = req.params.taskId, 
        entries = req.body.entries,
        i, index,
        removed = 0;

    if (entries && entries.length) {

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task;

        if (task) {

          if(collaboration.isCollaborator(user) || collaboration.isCreator(user)) {

            entries.forEach(function(entry) {

              index = -1;

              for (i = 0; i < task.entries.length; i++) {

                if (JSON.stringify(task.entries[i]) === JSON.stringify(entry)) {
                  index = i;
                  break;
                }
              } 

              if (index > -1) {
                removed += 1;
                task.entries.splice(index, 1);
              }

            });

            task.save(function(err) {
              if (err) {
                next(err);
              } else {

                debug('%s entries removed from task %s', removed, task._id);
                res.sendStatus(204);
              }
            });
          } else {
            debug('User %s is not allow to modify task %s', user, task._id);
            res.sendStatus(403);
          } 
        } else {
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
  router.get('/:taskId/entries', function(req, res, next) {

    var user = req.session.user._id; 

    Task.

    findById(req.params.groupId).

    deepPopulate('entries.user entries.group entries.pictures').

    sort('created').

    exec(function(err, task) {

      if (err) {
        next(err);
      } else if (task) {

        relations.membership(task.group, function(membership) {

          if (membership.isMember(user)) {

            res.send(task.entries);

          } else {
            debug('User %s is not allow to get information about task %s', user, task._id);
            res.sendStatus(403);
          }
        });
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Update entry info
   */
  router.post('/:taskId', function(req, res, next) {
    /** TODO */
  });

  /**
   * Get session user tasks
   */
  router.get('/me', function(req, res, next) {

    Task.

    find().
    where('collaborators', req.session.user._id).

    exec(function(err, tasks) {

      if (err) { 
        next(err);
      } else {
        res.send(tasks);
      }
    });

  });

};