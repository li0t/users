'use strict';

//var debug = require('debug')('app:api:users:invited');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var User = mongoose.model('user');
  var Profile = mongoose.model('profile');
  var Contact = mongoose.model('contact');
  var Token = mongoose.model('token');
  var Group = mongoose.model('group');

  /**
   * Create a new user and invite it to emeeter
   */
  router.post('/', function(req, res, next) {

    var email = req.body.email;

    new Profile().
    save(function(err, profile) {

      new User({
        email: email,
        /** Randomized alphanumeric password */
        password: Math.random().toString(36).slice(-8),
        profile: profile._id,
        state: statics.model('state', 'pending')._id
      }).
      save(function(err, user) {

        if (err) {
          /** The user is already in the platform */
          if (err.code && err.code === 11000) {
            res.sendStatus(409);
          } else if (err.name && err.name === 'ValidationError') {
            res.sendStatus(400);
          } else {
            next(err);
          }

          /** Remove unnecessary new profile */
          profile.remove();

        } else {

          new Contact({ user: user._id }).
          save(function(err) {
            if (err) {
              return next(err);
            }

            new Profile({ name: 'own' }).
            save(function(err, profile) {
              if (err) {
                return next(err);
              }

              new Group({ profile: profile._id }).
              save(function(err, group) {
                if (err) {
                  return next(err);
                }

                group.members.push({
                  user: user._id,
                  joined: new Date()
                });

                group.save(function(err) {
                  if (err) {
                    return next(err);
                  }

                  res.send(user._id);

                });
              });
            });
          });
        }
      });
    });
  });

  /**
   * Activation of invited user that already validated token
   */
  router.put('/validate/:token', function(req, res, next) {

    var password = req.body.password;

    if (password) {

      Token.findById(req.params.token, function(err, token) {
        if (err) {
          if (err.name && err.name === 'CastError') {
            res.sendStatus(400);
          } else {
            next(err);
          }

        } else if (token && token.user && token.sender) {

          User.findById(token.user, function(err, user) {
            if (err) {
              next(err);

            } else if (user) {

              user.password = password;

              user.state = statics.model('state', 'active')._id;

              user.save(function(err) {
                if (err) {
                  return next(err);
                }

                req.session.user = user;

                res.send(token._id);

              });
            } else {
              res.sendStatus(404);
            }
          });
        } else {
          res.sendStatus(498);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

};
