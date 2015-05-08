/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
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
              state: statics.model('state', 'pending')._id,
              objective: req.body.objective,
              priority: req.body.priority,
              dateTime: req.body.dateTime,
              notes: req.body.notes,
            }).

            save(function(err, task) {

              if ( err) {
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
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get session user tasks
   */
  router.get('/me', function(req, res, next) {

    Task.

    find().

    where('collaborators', req.session.user._id).

    sort('-created').

    exec(function(err, tasks) {

      if (err) { 
        next(err);
      } else {
        res.send(tasks);
      }
    });

  });

  /**
   * Get tasks of a group
   */
  router.get('/group/:id', function (req, res, next) {

    var user = req.session.user._id,
        group = req.params.id;

    relations.membership(group, function(relation) {

      if (relation.group) {

        if (relation.isMember(user)) {

          Task.

          find().

          where('group', group).

          sort('-created').

          exec(function (err, tasks) {

            if (err) {
              next(err);

            } else {

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
   * Add collaborators to a task
   */
  router.post('/:taskId/addCollaborators', function(req, res, next) {

    var task = req.params.taskId,
        inviter = req.session.user._id,
        collaborators = req.body.collaborators,
        saved = 0;

    if (collaborators && collaborators.length) {

      /** Prevent a mistype error */
      if (typeof collaborators === 'string') {
        collaborators = [collaborators];
      }

      relations.collaboration(task, function(relation) {

        task = relation.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(inviter)) { 

              collaborators.forEach(function(collaborator) {

                if (taskGroup.isMember(collaborator)) {

                  if (!relation.isCollaborator(collaborator)) {

                    debug('New collaborator %s added to task %s' , collaborator, task._id);
                    task.collaborators.push(collaborator);
                    saved += 1;

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
                  res.send(saved + ' of '+ collaborators.length +' new collaborators added to task ' +  task._id);

                }
              });
            } else {
              debug('User is not part of task group %s', inviter, task.group);
              res.sendStatus(403); 
            }
          });
        } else {
          debug('Task %s was not found' , req.params.taskId);
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
  router.post('/:taskId/removeCollaborators', function(req, res, next) { 

    var removed = 0,
        remover = req.session.user._id, 
        task = req.params.taskId,
        collaborators = req.body.collaborators,
        collaborator;

    if (collaborators && collaborators.length) { 

      /** Prevent a mistype error */
      if (typeof collaborators === 'string') {
        collaborators = [collaborators];
      }

      relations.collaboration(task, function(relation) {

        task = relation.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) { 

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(remover)) { /** Check if remover is part of the task group */

              collaborators.forEach(function(_collaborator) {

                collaborator = relation.isCollaborator(_collaborator);

                if (collaborator) { /** Check if user is part of the task collaborators array */

                  removed += 1;
                  debug('Collaborator %s removed from task %s', _collaborator, task._id);
                  task.collaborators.splice(collaborator.index, 1); /** Remove user from collaborators array */

                } else {
                  debug('User %s is not collaborator of task %s', _collaborator,  task._id);
                }
              });

              task.save(function(err) {
                if (err) {
                  next(err);

                } else {

                  debug('%s of %s collaborators removed from task %s', removed, collaborators.length, task._id);
                  res.send(removed + ' of '+ collaborators.length +' collaborators removed from task ' +  task._id);

                }
              });
            } else {
              debug('User %s is not part of task %s group' , remover, task.group);
              res.sendStatus(403);
            }
          });
        } else {
          debug('Task %s was not found' , req.params.taskId);
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

    findById(req.params.taskId).

    deepPopulate('collaborators.profile').

    exec(function(err, task) {

      if (err) {
        if (err.name && (err.name === 'CastError')) {
          res.sendStatus(400);
        } else {
          next(err);
        }
      } else if (task) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) {

            res.send(task.collaborators);

          } else {
            debug('User %s is not allowed to get information about task %s', user, task._id);
            res.sendStatus(403);
          }
        });
      } else {
        debug('Task %s was not found' , req.params.taskId);
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
        saved = 0,

        checkAndSave = function() {

          if (checked === entries.length) {
            task.save(function(err) {
              if (err) {
                next(err);
              } else {

                debug('%s of %s new entries added to task %s', saved, entries.length, task._id);
                res.send(saved + ' of ' + entries.length + ' new entries added to task ' +  task._id);

              }
            });
          }

        };

    if (entries && entries.length) {

      /** Prevent a mistype error */
      if (typeof entries === 'string') {
        entries = [entries];
      }

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) {  /** Check if user is part of task group */

              relations.
              contact(user, function(relation) {

                entries.forEach(function(entry) { 

                  Entry.findById(entry, function(err, _entry) {

                    checked += 1;

                    if (err) {
                      debug(err);

                    } else if (_entry) {
                      /** Check if user is contact of entry creator or is itself */
                      if (relation.isContact(_entry.user) || JSON.stringify(user) === JSON.stringify(_entry.user)) { 

                        saved += 1;
                        debug('Entry %s saved into task %s', entry, task._id);
                        task.entries.push(entry);

                      } else if (_entry.group) {

                        checked -= 1; /** Wait for asynchronous method to check this entry */

                        relations.membership(_entry.group, function(entryGroup) { 

                          if (entryGroup.isMember(user)) { /** Check if user is part of entry group */

                            saved += 1;
                            debug('Entry %s saved into task %s', entry, task._id);
                            task.entries.push(entry);

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
            } else {
              debug('User %s is not allowed to modify task %s', user, task._id);
              res.sendStatus(403);
            } 
          });
        } else {
          debug('Task %s was not found' , req.params.taskId);
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

    var remover = req.session.user._id,
        task = req.params.taskId, 
        entries = req.body.entries,
        i, index,
        removed = 0;

    if (entries && entries.length) {

      /** Prevent a mistype error */
      if (typeof entries === 'string') {
        entries = [entries];
      }

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(remover)) { /** Check if remover is part of the task group */

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
                  debug('Entry %s removed from task %s', entry, task._id);
                  task.entries.splice(index, 1);

                } else {
                  debug('Entry %s was not found in task %s', entry, task._id);
                }
              });

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('%s of %s entries removed from task %s', removed, entries.length, task._id);
                  res.send(removed + ' of '+ entries.length +' entries removed from task ' +  task._id);

                }
              });
            } else {
              debug('User %s is not part of task %s group' , remover, task.group);
              res.sendStatus(403);
            } 
          });
        } else {
          debug('Task %s was not found' , req.params.taskId);
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

    findById(req.params.taskId).

    deepPopulate('entries.user entries.group entries.pictures').

    sort('created').

    exec(function(err, task) {

      if (err) {
        next(err);
      } else if (task) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

            res.send(task.entries);

          } else {
            debug('User %s is not allowed to get information about task %s', user, task._id);
            res.sendStatus(403);
          }
        });
      } else {
        debug('Task %s was not found' , req.params.taskId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Add notes to a task
   */
  router.post('/:taskId/addNotes', function(req, res, next) {

    var task = req.params.taskId,
        user = req.session.user._id,
        notes = req.body.notes,
        saved = 0;

    if (notes && notes.length) {

      /** Prevent a mistype error */
      if (typeof notes === 'string') {
        notes = [notes];
      }

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              notes.forEach(function(note) { 

                if (note) {

                  saved += 1;
                  debug('Note -> %s added to task %s', note, task._id);
                  task.notes.push(note);

                }

              });

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('%s of %s new notes added to task %s', saved, notes.length, task._id);
                  res.send(saved + ' of '+ notes.length +' new notes added to task ' +  task._id);

                }
              });
            } else {
              debug('User %s is not allowed to modify task %s', user, task._id);
              res.sendStatus(403);
            } 
          });
        } else {
          debug('Task %s was not found' , req.params.taskId);
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
  router.post('/:taskId/removeNotes', function(req, res, next) {

    var task = req.params.taskId,
        user = req.session.user._id,
        notes = req.body.notes,
        removed = 0,
        i, index;

    if (notes && notes.length) {

      /** Prevent a mistype error */
      if (typeof notes === 'string') {
        notes = [notes];
      }

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              notes.forEach(function(note) { 

                if (note) {

                  index = -1;

                  for (i = 0; i < task.notes.length; i++) {

                    if (task.notes[i] === note) {
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
                }
              });

              task.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  debug('%s of %s notes removed from task %s', removed, notes.length, task._id);
                  res.send(removed + ' of '+ notes.length +' notes removed from task ' +  task._id);

                }
              });
            } else {
              debug('User %s is not allowed to modify task %s', user, task._id);
              res.sendStatus(403);
            } 
          });
        } else {
          debug('Task %s was not found' , req.params.taskId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Set entry as completed
   */
  router.get('/:taskId/complete', function(req, res, next) {

    var task = req.params.taskId,
        user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

            task.state = statics.model('state', 'completed')._id;

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
        debug('Task %s was not found' , req.params.taskId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Set entry as disabled
   */
  router.get('/:taskId/delete', function(req, res, next) {

    var task = req.params.taskId,
        user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task && (_.isEqual(task.state, statics.model('state', 'active')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'pending')._id))) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

            task.state = statics.model('state', 'disabled')._id;

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
        debug('Task %s was not found' , req.params.taskId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Re-open entry
   */
  router.get('/:taskId/reOpen', function(req, res, next) {

    var task = req.params.taskId,
        user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task && (_.isEqual(task.state, statics.model('state', 'completed')._id) ||                                                                                          _.isEqual(task.state, statics.model('state', 'disabled')._id))) {

        relations.membership(task.group, function(taskGroup) {

          if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

            task.state = statics.model('state', 'active')._id;

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
        debug('Task %s was not found' , req.params.taskId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Set entry datetime
   */
  router.get('/:taskId/dateTime/:dateTime', function(req, res, next) {
    /** TODO */
  });

  /**
   * Edit entry 
   */
  router.post('/:taskId', function(req, res, next) {
    /** TODO */
  });


};