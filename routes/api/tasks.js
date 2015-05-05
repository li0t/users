/* jshint node: true */
/* global component */
'use strict';

var //_ = require('underscore'),
    debug = require('debug')('app:api:tasks');

var relations = component('relations'),
    statics = component('statics');

module.exports = function (router, mongoose) {

  var Task = mongoose.model('task');

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