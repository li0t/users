/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
    debug = require('debug')('app:api:polls');

var relations = component('relations'),
    statics = component('statics');

module.exports = function (router, mongoose) {

  var Poll = mongoose.model('poll');

  /**
   * Create a new poll
   */
  router.post('/create', function(req, res, next) {
    
  /** TODO */

  });
  
  /**
   * Answer a poll
   */
  router.post('/:pollId/answer', function(req, res, next) {
    
    /** TODO */

  });
  
  /**
   * Get polls of a task
   */
  router.get('/task/:id', function (req, res, next) {
    
    /** TODO */

  });

  /**
   * Add collaborators to a poll
   */
  router.post('/:pollId/addCollaborators', function(req, res, next) {

    /** TODO */

  });

  /**
   * Remove collaborators from poll
   */
  router.post('/:pollId/removeCollaborators', function(req, res, next) { 

    /** TODO */
    
  });

  /**
   * Set poll as completed
   */
  router.get('/:pollId/complete', function(req, res, next) {
    
    /** TODO */
    
  });

  /**
   * Delete poll
   */
  router.get('/:pollId/delete', function(req, res, next) {

    /** TODO */
    
  });

  /**
   * Re-open poll
   */
  router.get('/:pollId/reOpen', function(req, res, next) {
    
    /** TODO */

  });


  /**
   * Edit poll basic data
   */
  router.post('/:pollId', function(req, res, next) {
    
    /** TODO */
    
  });
  
  /**
   * Get poll 
   */
  router.get('/:pollId', function(req, res, next) {

    /** TODO */
    
  });

};