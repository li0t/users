'use strict';

var debug = require('debug')('app:api:users:invited');

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
        state: statics.model('state', 'pending')._id,
        profile: profile._id
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
          profile.remove(function(err) {
            if (err) {
              debug(err);
            }
          });
          return;
        }

        new Contact({
          user: user._id
        }).
        save(function(err) {
          if (err) {
            return next(err);
          }

          new Profile({
            name: 'own'
          }).
          save(function(err, profile) {
            if (err) {
              return next(err);
            }

            new Group({
              profile: profile._id
            }).
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
      });
    });
  });

  /**
   * Activation of invited user that already validated token
   */
  router.put('/validate/:token', function(req, res, next) {

    var i, password = req.body.password;

    if (!password) {
      return res.sendStatus(400);
    }

    Token.findById(req.params.token, function(err, token) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          return res.sendStatus(400);
        }
        return next(err);
      }
      debug(token);
      if (!token || !token.user || !token.sender) {
        return res.sendStatus(498);
      }

      User.findById(token.user, function(err, user) {
        if (err) {
          return next(err);

        }

        if (!user) {
          return res.sendStatus(404);
        }

        user.password = password;

        user.state = statics.model('state', 'active')._id;

        user.save(function(err) {
          if (err) {
            return next(err);
          }

          Group.find().

          where('members.user', user).

          populate('profile').

          exec(function(err, groups) {
            if (err) {
              return next(err);
            }

            for (i = 0; i < groups.length; i++) {
              if (groups[i].profile.name === 'own') {

                user = user.toObject();
                user.group = groups[i];

                req.session.user = user;
                return res.send(token._id);

              }
            }
          });
        });
      });
    });

  });

};
