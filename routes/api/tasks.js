/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
    debug = require('debug')('app:api:tasks');

var statics = component('statics');

module.exports = function (router, mongoose) {

  var Task = mongoose.model('task'),
      Group = mongoose.model('group'),
      //User = mongoose.model('user'),
      //Entry = mongoose.model('entry'),
      Contact = mongoose.model('contact');

  /**
   * Create new task
   */
  router.post('/create', function(req, res, next) {

    var i, isMember = false;
    /** TODO: Check if priority exists */

    Group.
    findById(req.body.group, function(err, group){

      if (err) {
        if (err.name && (err.name === "CastError" || err.name === "ValidationError")) {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (group) {

        for (i = 0; i < group.members.length; i++) {
          if (JSON.stringify(group.members[i].user) === JSON.stringify(req.session.user._id)) { /** Lookup the user in the group */
            isMember = true;
            break;
          }
        }

        if (isMember) { 

          new Task({
            group: group._id,
            creator: req.session.user._id,
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
          debug('User is not part of group %s', req.session.user._id, group._id);
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

    var users = req.body.users,
        i, saved = 0,
        isMember = false,
        isContact;

    Task.findById(req.params.taskId, function(err, task) {

      if (err) {
        if (err.name && (err.name === "CastError" || err.name === "ValidationError")) {
          res.sendStatus(400);
        } else {
          next(err);
        }
      } else if (task) {

        Group.findById(task.group, function(err, group) {

          if (err) {
            next(err);
          } else {

            for (i = 0; i < group.members.length; i++) {
              if (JSON.stringify(group.members[i].user) === JSON.stringify(req.session.user._id)) { /** Lookup the user in the task group */
                isMember = true;
                break;
              }
            }

            if (isMember) { 

              Contact.

              findOne().
              where('user', req.session.user._id).

              exec(function(err, inviter) {

                if (err) {
                  next(err);
                } else {

                  users.forEach(function(user) {

                    isContact = false;

                    if (mongoose.Types.ObjectId.isValid(user)) {

                      for (i = 0; i < inviter.contacts.length; i++) {
                        if (JSON.stringify(inviter.contacts[i].user) === JSON.stringify(user)) { /** Check if the user is contact of the creator */
                          if (_.isEqual(inviter.contacts[i].state, statics.model('state', 'active')._id)) { 
                            isContact = true;
                            break;
                          }
                        }
                      }

                      if (isContact) {
                        task.users.push(user);
                        saved += 1;

                      } else {
                        debug('Users %s and %s are not contacts with each other', inviter.user, user);
                        res.sendStatus(403);
                      }
                    }
                  });

                  debug('Pushed %s users of %s', saved, users.length);

                  task.save(function(err) {
                    if (err) {
                      next(err);
                    } else {
                      res.sendStatus(204);
                    }
                  });
                }
              });
            } else {
              debug('User is not part of group %s', req.session.user._id, group._id);
              res.sendStatus(403); 
            }
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
  router.post('/:taskId/removeUsers', function(req, res, next) {

  });

  /**
   * Get task users
   */
  router.get('/:taskId/users', function(req, res, next) {


  });

  /**
   * Add an entry to a task
   */
  router.post('/:taskId/addEntries', function(req, res, next) {


  });

  /**
   * Remove an entry from task
   */
  router.post('/:taskId/removeEntries', function(req, res, next) {

  });

  /**
   * Get task entries
   */
  router.get('/:taskId/entries', function(req, res, next) {


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