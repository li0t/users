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

    var creator = req.session.user._id,
        group = req.body.group,
        priority = null;

    relations.membership(group, function(membership) {

      group = membership.group;

      if (group) {

        if (membership.isMember(creator)) { 

          statics.models.priority.forEach(function(slug) { /** Search the priority id in the priority static model */

            if (JSON.stringify(slug._id) === JSON.stringify(req.body.priority)){
              priority = slug._id;
            }

          });

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
   * Add users to a task
   */
  router.post('/:taskId/addUsers', function(req, res, next) {

    var inviter = req.session.user._id,
        users = req.body.users,
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

              users.forEach(function(user) {

                if (relation.isContact(user)) {
                  task.users.push(user);
                  saved += 1;

                } else {
                  debug('Users %s and %s are not contacts with each other', inviter, user);
                }
              });

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('Pushed %s users of %s', saved, users.length);
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
   * Remove user from task
   */
  router.post('/:taskId/removeUsers', function(req, res, next) { /** Who's allow to do this? */

    var toRemove, removed = 0,
        remover = req.session.user._id, 
        task = req.params.taskId,
        users = req.body.users;

    if (users && users.length) { 

      relations.collaboration(task, function(relation) {

        task = relation.task; /** The task model */

        if (task) { 

          remover = relation.isCreator(remover);

          if (remover) { /** Check if remover is part of the task collaborators array */

            users.forEach(function(user) {

              toRemove = relation.isCollaborator(user);

              if (toRemove) { /** Check if user is part of the task collaborators array */

                removed += 1;
                debug('User %s removed from task %s' , user, task._id);
                task.users.splice(toRemove.index, 1); /** Remove user from collaborators array */

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
   * Get task users
   */
  router.get('/:taskId/users', function(req, res, next) {

    var user = req.session.user._id; 

    Task.

    findById(req.params.groupId).

    deepPopulate('users.profile').

    exec(function(err, task) {

      if (err) {
        next(err);
      } else if (task) {

        relations.membership(task.group, function(membership) {

          if (membership.isMember(user)) {

            res.send(task.users);

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


  });

  /**
   * Get user tasks
   */
  router.get('/me', function(req, res, next) {


  });

};