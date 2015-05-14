/* jshint node: true */
'use strict';

var //bcrypt = require('bcrypt'),
//_ = require('underscore'),
debug = require('debug')('app:api:search');

module.exports = function (router, mongoose) { /** TODO: Validate if user is active*/

  var User = mongoose.model('user')/*,
      Contact = mongoose.model('contact')*/;

  router.post('/email', function(req, res, next){

    User.findOne().

    where('email', req.body.email).

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
        debug("User %s was not found and an invitation email it's beign sent",  req.body.email);
        res.redirect('/api/users/createAndInvite/' + req.body.email); 
      }
    });

  });

};