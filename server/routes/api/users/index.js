'use strict';

var bcrypt = require('bcrypt');
var _ = require('underscore');
var debug = require('debug')('app:api:users');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var User = mongoose.model('user');
  var Profile = mongoose.model('profile');
  var Contact = mongoose.model('contact');
  var Token = mongoose.model('token');
  var Group = mongoose.model('group');

  /**
   * Get users list.
   */
  router.get('/', function(req, res, next) {

    User.find().

    where('state', statics.model('state', 'active')._id).

    exec(function(err, users) {

      if (err) {
        next(err);

      } else {

        res.send(users);
      }

    });

  });

  /**
   * Create a new user
   */
  router.post('/', function(req, res, next) {

    new Profile().
    save(function(err, profile) { /* Create a new Profile that will store the user information */
      if (err) {
        return next(err);
      }

      new User({
        email: req.body.email,
        password: req.body.password,
        profile: profile._id,
        state: statics.model('state', 'pending')._id
      }).
      save(function(err, user) {
        if (err) {
          /* Check for duplicated entry */
          if (err.code && err.code === 11000) {
            res.sendStatus(409);
          } else if (err.name && err.name === 'ValidationError') {
            res.sendStatus(400);
          } else {
            next(err);
          }
          profile.remove(function(err) {
            if (err) {
              debug(err);
            }
          });
        } else {

          /* Create a new ContactSchema that will store the user contacts */
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
            save(function(err, groupProfile) {
              if (err) {
                return next(err);
              }

              new Group({
                profile: groupProfile._id
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
        }
      });
    });

  });

  /**
   * Log a user in.
   */
  router.post('/signin', function(req, res, next) {
    console.log('im here');

    var i;
    var email = req.body.email;
    var password = req.body.password;

    if (email && password) {

      /* Logout any previous user */
      delete req.session.user;
      delete req.session.workplace;

      /* Find the user by its email address */
      User.findOne().

      where('email', email).

      deepPopulate('profile.gender').

      exec(function(err, user) {
        if (err) {
          if (err.name && (err.name === 'ValidationError' || err.name === 'CastError')) {
            res.sendStatus(400);
          } else {
            next(err);
          }

        } else if (user && bcrypt.compareSync(password, user.password)) { /* Check if there's a user and compare the passwords */

          if (_.isEqual(user.state, statics.model('state', 'active')._id)) { /* Check if the user has confirmed it's email */

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
                  return res.send(user);

                }
              }
            });

          } else if (_.isEqual(user.state, statics.model('state', 'pending')._id)) {

            res.sendStatus(409);

          } else if (_.isEqual(user.state, statics.model('state', 'disabled')._id)) {

            res.sendStatus(403);

          } else {

            res.sendStatus(500);

          }
        } else {
          setTimeout(function() {
            res.sendStatus(401);
          }, 1000);
        }
      });

    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Logs a user out.
   */
  router.get('/signout', function(req, res /*, next*/ ) {

    delete req.session.user;

    res.end();

  });

  /**
   * Begin password reset.
   */
  router.post('/recover', function(req, res /*, next*/ ) {

    var email = req.body.email;

    if (email) {

      res.redirect('/api/mandrill/recover/' + email);

    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Reset password of user that already validated token
   */
  router.post('/reset/:token', function(req, res, next) {

    var password = req.body.password;

    Token.findById(req.params.token, function(err, token) {
      if (err) {
        return next(err);
      }

      if (!token) {
        return res.sendStatus(498);
      }

      if (!password) {
        return res.sendStatus(400);
      }

      User.findById(token.user, function(err, user) { /** Find user that sent the reset request */
        if (err) {
          return next(err);
        }

        if (!user) {
          debug('No user found for id ' + req.session.token.user);
          return res.sendStatus(404);
        }

        user.password = password;

        user.save(function(err) {
          if (err) {
            return next(err);
          }

          delete req.session.token;

          req.session.user = user;

          res.end();

          token.remove(function(err) {
            if (err) {
              debug(err);
            }
          });
        });
      });
    });
  });

  /**
   * Changes user password
   */
  router.put('/change-password', function(req, res, next) {

    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;

    if (newPassword && newPassword !== oldPassword) {

      User.

      findById(req.session.user._id).

      exec(function(err, user) {

        if (err) {
          next(err);

        } else if (user && bcrypt.compareSync(oldPassword, user.password)) { /* Check if there's a user and compare the passwords */

          user.password = newPassword;

          user.save(function(err, user) {

            req.session.user = user;
            res.send(user._id);

          });
        } else {
          setTimeout(function() {
            res.sendStatus(401);
          }, 1000);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Disable the user's account
   */
  router.delete('/', function(req, res, next) {

    var user = req.session.user._id;
    var userContact;
    var index;

    relations.contact(user, function(err, relation) {

      if (!err && relation.contact) {

        userContact = relation.contact; /** The user contact model */

        userContact.contacts.forEach(function(contact) {

          contact.state = statics.model('state', 'disabled')._id; /** Set the user contact as disabled */

          relations.contact(contact.user, function(err, relation) {

            if (!err && relation.contact) {

              index = relation.isContact(user, true).index; /** The index of session user in the contact contacts list */

              contact = relation.contact;

              contact.contacts[index].state = statics.model('state', 'disabled')._id; /** Set itself as disabled in the contact contacts list */

              contact.save(function(err) {
                if (err) {
                  debug(err);
                }
              });
            }
          });
        });

        userContact.save(function(err) {
          if (err) {
            next(err);
          } else {

            User.findById(user, function(err, user) {
              if (err) {
                next(err);
              } else {

                user.state = statics.model('state', 'disabled')._id; /** Set itself as disabled */

                user.save(function(err) {

                  if (err) {
                    next(err);

                  } else {
                    delete req.session.user;
                    res.sendStatus(204);
                  }
                });
              }
            });
          }
        });
      } else {
        debug('No contacts list for user %s was found', user);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Validate email of new user
   */
  router.put('/validate/:token', function(req, res, next) {

    Token.findById(req.params.token, function(err, token) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (token) {

        User.
        findOneAndUpdate({
          _id: token.user
        }, {
          state: statics.model('state', 'active')._id
        }).

        exec(function(err, user) {
          if (err) {
            return next(err);
          }

          req.session.user = user;
          res.status(204).end();

          token.remove(function(err) {
            if (err) { debug(err); }
          });

        });
      } else {
        res.sendStatus(498);
      }
    });

  });

  /**
   * Get a user and populate it's profile
   */
  router.get('/:id', function(req, res, next) {

    User.

    findById(req.params.id).
    deepPopulate('profile.pictures'). /* Retrieve data from linked schemas */

    exec(function(err, user) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (user) {

        res.send(user);

      } else {
        res.sendStatus(404);
      }
    });

  });

};
