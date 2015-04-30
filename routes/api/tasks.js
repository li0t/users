/* jshint node: true */
'use strict';

var _ = require('underscore'),
    debug = require('debug')('app:api:tasks'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };

module.exports = function (router, mongoose) {

  var Group = mongoose.model('group'),
      User = mongoose.model('user'),
      Contact = mongoose.model('contact'),
      Profile = mongoose.model('profile');

  /** 
   * Looks for statics states and saves the ids
   * FALLS WHEN THERE ARE NO STATICS INSTALLED
   */
  (function getStates() {
    var
    Sts = mongoose.model('static.state'),
        state;

    function lookup(name) {
      Sts.findOne({
        name: name
      }, function (err, found) {
        if (err) {
          debug('Error! : %s', err);
        } else {
          States[name] = found._id;
        }
      });
    }

    for (state in States) {
      if (States.hasOwnProperty(state)) {
        lookup(state);
      }
    }
  })();

  /**
   * Create new task
   */
  router.post('/create', function(req, res, next) {


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