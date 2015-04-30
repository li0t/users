/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
    debug = require('debug')('app:api:tasks');

var statics = component('statics');

module.exports = function (router, mongoose) {

  var Task = mongoose.model('task'),
      Group = mongoose.model('group'),
      User = mongoose.model('user'),
      Contact = mongoose.model('contact');

  /**
   * Create new task
   */
  router.post('/create', function(req, res, next) {

    new Task({
      creator: req.session.user._id,
      status: statics.model('state', 'pending')._id,
      objective: req.body.objective,
      users: req.body.users,
      priority: req.body.priority,
      dateTime: req.body.dateTime,
      notes: req.body.notes,
      entries: req.body.entries
    }).

    save(function(err, task){

      if(err){
        if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else {

        res.status(201).send(task._id);

      }
    });

  });

  /**
   * Add user to a task
   */
  router.get('/:taskId/addUser/:id', function(req, res, next) {


  });

  /**
   * Remove user from task
   */
  router.get('/:taskId/removeUser/:id', function(req, res, next) {

  });

  /**
   * Get task users
   */
  router.get('/:taskId/users', function(req, res, next) {


  });

  /**
   * Add an entry to a task
   */
  router.get('/:taskId/addEntry/:id', function(req, res, next) {


  });

  /**
   * Remove an entry from task
   */
  router.get('/:taskId/removeEntry/:id', function(req, res, next) {

  });

  /**
   * Get task entries
   */
  router.get('/:taskId/entries', function(req, res, next) {


  });

  /**
   * Get user tasks
   */
  router.get('/me', function(req, res, next) {


  });

};