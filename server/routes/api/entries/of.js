'use strict';

var debug = require('debug')('app:api:entries:of');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Entry = mongoose.model('entry');

  /**
   * Get entries of an user
   */
  router.get('/user/:id', function(req, res, next) {

    var user = req.params.id;

    relations.contact(user, function(err, relation) {

      if (err || !relation.contact) {
        debug('User %s and %s are not contacts with each other', user, req.session.user._id);
        return res.sendStatus(403);
      }

      if (!relation.isContact(req.session.user._id) && user !== req.session.user._id) {
        debug('User %s was not found', user);
        return res.sendStatus(404);
      }

      Entry.find().

      where('user', user).

      populate('pictures documents').

      sort('-created').

      exec(function(err, entries) {
        if (err) {
          return next(err);
        }

        res.send(entries);

      });
    });

  });

  /**
   * Get entries with files of an user
   */
  router.get('/user/:id/type/:type', function(req, res, next) {

    var user = req.params.id;
    var type = req.params.type;

    relations.contact(user, function(err, relation) {

      if (err || !relation.contact) {
        debug('User %s and %s are not contacts with each other', user, req.session.user._id);
        return res.sendStatus(403);
      }

      if (!relation.isContact(req.session.user._id) && user !== req.session.user._id) {
        debug('User %s was not found', user);
        return res.sendStatus(404);
      }

      Entry.find().

      where('user', user).
      where('type', type).

      populate('pictures documents').

      sort('-created').

      exec(function(err, entries) {
        if (err) {
          return next(err);

        }

        res.send(entries);

      });
    });

  });

  /**
   * Get entries of a group
   */
  router.get('/group/:id', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;

    relations.membership(group, function(err, relation) {

      if (err || !relation.group) {
        debug('User %s is not part of group %s', req.session.user._id, group);
        return res.sendStatus(403);
      }

      if (!relation.isMember(user)) {
        debug('Group  %s was not found', group);
        return res.sendStatus(404);
      }

      Entry.find().

      where('group', group).

      populate('pictures documents').

      sort('-created').

      exec(function(err, entries) {
        if (err) {
          return next(err);
        }

        res.send(entries);

      });
    });

  });

  /**
   * Get entries with files of a group
   */
  router.get('/group/:id/type/:type', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;
    var type = req.params.type;

    relations.membership(group, function(err, relation) {

      if (err || !relation.group) {
        debug('Group  %s was not found', group);
        return res.sendStatus(404);
      }

      if (!relation.isMember(user)) {
        debug('User %s is not part of group %s', req.session.user._id, group);
        return res.sendStatus(403);
      }

      Entry.find().

      where('group', group).
      where('type', type).

      populate('pictures documents').

      sort('-created').

      exec(function(err, entries) {
        if (err) {
          return next(err);
        }

        res.send(entries);

      });
    });

  });

};