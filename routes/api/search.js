/* jshint node: true */
/* global component */
'use strict';

var bcrypt = require('bcrypt');
var _ = require('underscore');
var debug = require('debug')('app:api:search');

var statics = component('statics');

module.exports = function(router, mongoose) { /** TODO: Validate if user is active*/

  var User = mongoose.model('user');
  var Contact = mongoose.model('contact');

  router.post('/email', function(req, res, next) {

    var email = req.body.email;

    if (email) {

      User.findOne().

      where('email', email).

      where('state', statics.model('state', 'active')._id).

      exec(function(err, user) {
        if (err) {
          if (err.name && (err.name === 'ValidationError' || err.name === 'CastError')) {
            res.sendStatus(400);
          } else {
            next(err);
          }

        } else if (user) {

          res.send(user._id);

        } else {
          debug("User %s was not found", req.body.email);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }
  });

};
