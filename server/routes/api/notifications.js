'use strict';

//var debug = require('debug')('app:api:notifications');

module.exports = function(router, mongoose) {

  var Notification = mongoose.model('notification');

  router.get('/', function(req, res, next) {

    var user = req.session.user._id;
    var actions = req.query.actions; /** Type of notification to filter */
    var limit = req.query.limit;
    var present;

    Notification.find().

    deepPopulate('interaction.sender interaction.action').

    limit(limit).

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

      res.send(nots);

    });

  });


  router.get('/viewed', function(req, res, next) {

  });

  router.get('/accepted', function(req, res, next) {

  });


};
