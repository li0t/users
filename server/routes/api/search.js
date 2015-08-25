'use strict';

var debug = require('debug')('app:api:search');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var User = mongoose.model('user');

  router.post('/email', function(req, res, next) {

    var email = req.body.email;

    if (!email) {
      return res.sendStatus(400);
    }

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
        return;
      }

      if (!user) {
        debug("User %s was not found", req.body.email);
        return res.sendStatus(404);
      }

      res.send(user);

    });
    
  });

};
