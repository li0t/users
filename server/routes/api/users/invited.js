'use strict';

var debug = require('debug')('app:api:users:invited');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var Interaction = mongoose.model('interaction');
  var Profile = mongoose.model('profile');
  var Contact = mongoose.model('contact');
  var Group = mongoose.model('group');
  var User = mongoose.model('user');

  /**
   * Create a new invited User.
   *
   * @type Express Middleware.
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
   * Activate invited User.
   *
   * @type Express Middleware.
   */
  router.put('/validate/:token', function(req, res, next) {

    var password = req.body.password;
    var i;

    if (!password) {
      return res.sendStatus(400);
    }

    Interaction.findOne().

    where('token', req.params.token).

    exec(function(err, inter) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          return res.sendStatus(400);
        }
        return next(err);
      }

      if (!inter || !inter.sender || !inter.receiver) {
        return res.sendStatus(498);
      }

      User.findById(inter.receiver).

      deepPopulate('profile.gender').

      exec(function(err, user) {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.sendStatus(400);
        }

        user.state = statics.model('state', 'active')._id;
        user.password = password;

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
                return res.send(inter.token);

              }
            }
          });
        });
      });
    });

  });

};
