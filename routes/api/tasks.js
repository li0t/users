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
  router.post('/create', function(req, res, next) {

    var dateTime = req.body.dateTime || null;

    new Task({
      creator: req.session.user._id,
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

    populate('collaborators entries priority').

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
   * Get tasks where session user is collaborator
   */
  router.get('/collaborator', function(req, res, next) {

    var user = req.session.user._id;
    var tasks = [];
    var i;
    var isCollaborator;

    Task.

    find().

    where('collaborators.user', user).

    where('deleted', null).

    populate('collaborators.user entries priority').

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

          deepPopulate('entries').

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
  router.post('/:id/addCollaborators', function(req, res, next) {

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

      relations.collaboration(task, function(relation) {

        task = relation.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task) {

          if (!task.completed) {

            relations.membership(task.group, function(taskGroup) {

              if (taskGroup.isMember(inviter)) {

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
  router.post('/:id/removeCollaborators', function(req, res, next) {

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

      relations.collaboration(task, function(relation) {

        task = relation.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task) {

          if (!task.completed) {

            relations.membership(task.group, function(taskGroup) {

              if (taskGroup.isMember(remover)) { /** Check if remover is part of the task group */

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

  /**
   * Add notes to a task
   */
  router.post('/:id/addNotes', function(req, res, next) {

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

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task) {

          if (!task.completed) {

            relations.membership(task.group, function(taskGroup) {

              if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

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
  router.post('/:id/removeNotes', function(req, res, next) {

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

      relations.collaboration(task, function(collaboration) {

        task = collaboration.task; /** The task model */

        /** Check if task exists and is available for changes */
        if (task) {

          if (!task.completed) {

            relations.membership(task.group, function(taskGroup) {

              if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

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

  /**
   * Set task as completed
   */
  router.put('/:id/complete', function(req, res, next) {

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
  router.put('/:id/delete', function(req, res, next) {

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
  router.put('/:id/re-open', function(req, res, next) { /** TODO: remove completed field if necessary */

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
  router.post('/:id/priority', function(req, res, next) {

    var task = req.params.id;
    var user = req.session.user._id;

    relations.collaboration(task, function(collaboration) {

      task = collaboration.task; /** The task model */

      /** Check if task exists and is available for changes */
      if (task) {

        if (!task.completed) {

          relations.membership(task.group, function(taskGroup) {

            if (taskGroup.isMember(user)) { /** Check if user is part of the task group */

              task.priority = req.body.priority || task.priority;

              task.save(function(err) {
                if (err) {
                  if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
                    res.status(400).send(err);
                  } else {
                    next(err);
                  }
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
  router.post('/:id/dateTime', function(req, res, next) {

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
                  /** Check if user is not currently a task collaborator */
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
