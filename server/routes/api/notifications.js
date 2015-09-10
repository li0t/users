'use strict';

var debug = require('debug')('app:api:notifications');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var Notification = mongoose.model('notification');
  var Interaction = mongoose.model('interaction');

  router.get('/', function(req, res, next) {

    var user = req.session.user._id;
    var actions = req.query.actions; /** Type of notification to filter */
    var skip = Number(req.query.skip);
    var limit = Number(req.query.limit);
    var present;

    Notification.find().

    deepPopulate('interaction.sender interaction.action').

    sort('-_id').

    exec(function(err, nots) {
      if (err) {
        return next(err);
      }

      nots = nots.filter(function(not) {
        present = false;
        if (not.interaction.receiver.equals(user)) {
          if (actions.indexOf(not.interaction.action.slug > -1)) {
            present = true;
          }
        }
        return present;
      });

      nots = (skip && nots.slice(skip)) || nots;
      nots = (limit && nots.slice(0, limit)) || nots;

      res.send(nots);

    });

  });

  router.get('/last', function(req, res, next) {

    var user = req.session.user._id;
    var actions = req.query.actions;
    var or = [];

    actions.forEach(function(action) {
      action = statics.model('action', action) && statics.model('action', action)._id;
      or.push({
        action: action
      });
    });

    Interaction.find().

    where('receiver', user).
    or(or).
    sort('-_id').

    exec(function(err, found) {
      if (err) {
        return next(err);
      }

      if (!found.length) {
        return res.sendStatus(404);
      }

      Notification.findOne().

      where('interaction', found[0]._id).

      deepPopulate('interaction.sender interaction.action').

      exec(function(err, not) {
        if (err) {
          return next(err);
        }

        res.send(not);

      });
    });

  });


  router.put('/:id/viewed', function(req, res, next) {

    Notification.update({
      _id: req.params.id
    }, {
      viewed: new Date()
    }).
    exec(function(err, affected) {
      if (err) {
        return next(err);
      }

      if (!affected) {
        return res.sendStatus(400);
      }

      res.end();

    });

  });




};
