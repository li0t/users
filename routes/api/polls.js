/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:polls');

var relations = component('relations');
var statics = component('statics');

module.exports = function (router, mongoose) { /** TODO: Implement link to meetings */

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
  router.post('/:id/answer', function(req, res, next) {

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
  router.post('/:id/addCollaborators', function(req, res, next) {

    /** TODO */

  });

  /**
   * Remove collaborators from poll
   */
  router.post('/:id/removeCollaborators', function(req, res, next) {

    /** TODO */

  });

  /**
   * Set poll as completed
   */
  router.get('/:id/complete', function(req, res, next) {

    /** TODO */

  });

  /**
   * Delete poll
   */
  router.get('/:id/delete', function(req, res, next) {

    /** TODO */

  });

  /**
   * Re-open poll
   */
  router.get('/:id/reOpen', function(req, res, next) {

    /** TODO */

  });


  /**
   * Edit poll basic data
   */
  router.post('/:id', function(req, res, next) {

    /** TODO */

  });

  /**
   * Get poll
   */
  router.get('/:id', function(req, res, next) {

    /** TODO */

  });

};
