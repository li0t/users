/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:entries:users:');

var relations = component('relations');
var statics = component('statics');
var gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');
  var Tag = mongoose.model('tag');
  var Task = mongoose.model('task');

  /**
   * Get entries of an user
   */
  router.get('/:id', function(req, res, next) {

    var user = req.params.id;

    relations.contact(user, function(relation) {

      if (relation.contact) {

        if (relation.isContact(req.session.user._id) || user === req.session.user._id) {

          Entry.

          find().

          where('user', user).

          populate('pictures'). /* Retrieves data from linked schemas */

          sort('-created').

          exec(function(err, entries) {
            if (err) {
              next(err);

            } else {

              res.send(entries);

            }
          });
        } else {
          debug('User %s and %s are not contacts with each other', user, req.session.user._id);
          res.sendStatus(403);
        }
      } else {
        debug('User %s was not found', user);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get entries with files of an user
   */
  router.get('/:id/with-files', function(req, res, next) {

    var user = req.params.id;

    relations.contact(user, function(relation) {

      if (relation.contact) {

        if (relation.isContact(req.session.user._id) || user === req.session.user._id) {

          Entry.

          find({
            $where: 'this.pictures.length > 0'
          }).

          where('user', user).

          populate('pictures'). /* Retrieves data from linked schemas */

          sort('-created').

          exec(function(err, entries) {
            if (err) {
              next(err);

            } else {

              res.send(entries);

            }
          });
        } else {
          debug('User %s and %s are not contacts with each other', user, req.session.user._id);
          res.sendStatus(403);
        }
      } else {
        debug('User %s was not found', user);
        res.sendStatus(404);
      }
    });

  });

};
