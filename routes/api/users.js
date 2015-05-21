/* jshint node: true */
/* global component */
'use strict';

var bcrypt = require('bcrypt'),
    _ = require('underscore'),
    debug = require('debug')('app:api:users');

var relations = component('relations'),
    statics = component('statics');

module.exports = function (router, mongoose) {

  var User = mongoose.model('user'),
      Profile = mongoose.model('profile'),
      Contact = mongoose.model('contact'),
      Token = mongoose.model('token');

  /** 
   * Get users list.
   */
  router.get('/', function (req, res, next) {

    User.find().

    where('state' , statics.model('state', 'active')._id).

    exec(function (err, users) {

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
  router.post('/create', function (req, res, next) {

    new Profile().

    save(function (err, profile) { /* Create a new Profile that will store the user information */
      if (err) {
        next(err);
      } else {

        new User({
          email: req.body.email,
          password: req.body.password,
          profile: profile._id,
          state: statics.model('state', 'pending')._id 
        }).

        save(function (err, user) {
          if (err) {
            /* Check for duplicated entry */
            if (err.code && err.code === 11000) {
              res.sendStatus(409);
            } else if (err.name && err.name === 'ValidationError') {
              res.sendStatus(400);
            } else {
              next(err);
            }
          } else {

            new Contact({ /* Create a new ContactSchema that will store the user contacts */
              user: user._id
            }).

            save(function (err) {
              if (err) {
                next(err);
              } else {
                res.redirect('/api/mandrill/signin/' + user._id); 
              }
            });
          }
        });
      }
    });

  });

  /**
   * Log a user in.
   */
  router.post('/login', function (req, res, next) {

    var email = req.body.email,
        password = req.body.password;

    if (email && password) {

      /* Logout any previous user */
      delete req.session.user;
      delete req.session.workplace;

      /* Find the user by its email address */
      User.

      findOne().
      where('email', email).

      exec(function (err, user) {

        if (err) {

          if (err.name && (err.name === 'ValidationError' || err.name === 'CastError')) {
            res.sendStatus(400);
          } else {
            next(err);
          }

        } else if (user && bcrypt.compareSync(password, user.password)) { /* Check if there's a user and compare the passwords */

          if (_.isEqual(user.state, statics.model('state', 'active')._id)) { /* Check if the user has confirmed it's email */

            req.session.user = user;
            res.send(user._id);

          } else if (_.isEqual(user.state, statics.model('state', 'pending')._id)) {

            res.status(409).send("Looks like you havent confirmed your email yet.");

          } else {

            res.status(409).send("Looks like you have disabled your account.");
          }
        } else {
          setTimeout(function () {
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
  router.get('/logout', function (req, res/*, next*/) {

    delete req.session.user;

    res.end();

  });

  /**
   * Begin password reset.
   */
  router.post('/recover', function (req, res/*, next*/) {

    var email = req.body.email;

    if (email) {

      res.redirect('/api/mandrill/recover/' + email);

    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Validate token for password reset
   */
  router.get('/recover/:token', function (req, res, next) {

    Token.findById(req.params.token, function(err, token){

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (token){

        req.session.token = token;
        res.send('Please choose a new password.');

      } else {
        res.status(498).send('This token is not active anymore');
      }
    });

  });

  /**
   * Reset password of user that already validated token
   */
  router.post('/resetPassword', function(req, res, next) {

    var token = req.session.token,
        password = req.body.password;

    if (token) {

      if (password) { 

        User.findById(token.user, function(err, user) { /** Find user that sent the reset request */
          if (err) {
            next(err);

          } else if (user) {

            user.password = password;

            user.save(function(err) {

              if (err) {
                next(err);

              } else {

                req.session.user = user;

                res.send('Password reset successful');

                delete req.session.token; /** IMPORTANT! Token seems to survive this action */

                Token.remove({_id : token._id}, function(err) {
                  if (err) {
                    debug('Error! ' + err); 
                  }
                });
              }
            });
          } else {
            debug('No user found for id ' + req.session.token.user);
            res.sendStatus(404);  
          }
        });
      } else {
        res.status(400).send('You must set a new password');
      }
    } else {
      res.sendStatus(403);
    }
  });

  /**
   * Changes user password
   */
  router.post('/changePassword', function (req, res, next) {

    var oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;

    if (newPassword && (newPassword !== oldPassword)) {

      User.

      findById(req.session.user._id).

      exec(function (err, user) {

        if (err) {
          next(err);

        } else if (user && bcrypt.compareSync(oldPassword, user.password)) { /* Check if there's a user and compare the passwords */

          user.password = newPassword;

          user.save(function (err, user) {

            req.session.user = user;
            res.send(user._id);

          });
        } else {
          setTimeout(function () {
            res.sendStatus(401);
          }, 1000);
        }
      }); 
    } else {
      res.status(400).send('The new password should be different');
    }

  });

  /**
   * Disable the user's account
   */
  router.get('/disable', function (req, res, next) { /** TODO: Check asynchronous method */

    var user = req.session.user._id,
        userContact,
        index;

    relations.contact(user, function(relation) {

      userContact = relation.contact; /** The user contact model */

      if (userContact) {

        userContact.contacts.forEach(function(contact) { 

          contact.state = statics.model('state', 'disabled')._id;  /** Set the user contact as disabled */

          relations.contact(contact.user, function(relation) {      

            index = relation.isContact(user, true).index; /** The index of session user in the contact contacts list */

            contact = relation.contact;

            contact.contacts[index].state = statics.model('state', 'disabled')._id; /** Set itself as disabled in the contact contacts list */

            contact.save(function(err) {
              if (err) {
                debug(err);
              }
            });
          });          
        });

        userContact.save(function(err) {
          if (err) {  
            next(err);
          } else {

            User.findById(user, function(err, user){
              if (err) { 
                next(err);
              } else {

                user.state = statics.model('state', 'disabled')._id; /** Set itself as disabled */

                user.save(function(err){

                  if(err){
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
   * Create a new user and invite it to emeeter
   */
  router.get('/createAndInvite/:email', function(req, res ,next) {

    var email = req.params.email;

    if (email) {

      new Profile().
      save(function(err, profile) {

        new User({
          email : email,
          password: Math.random().toString(36).slice(-8), /** Randomized alphanumeric password */
          profile: profile._id,
          state: statics.model('state', 'pending')._id
        }). 

        save(function(err, user) {

          if (err) {
            /** The user is already in the platform */
            if (err.code && err.code === 11000) {

              User.   
              findOne().
              where('email', email).
              exec(function(err, user) {
                if (err) {
                  next(err);
                } else if (user){
                  /** Send contact request */
                  res.redirect('/api/contacts/add/' + user._id);
                }
              });
            } else if (err.name && err.name === 'ValidationError') {
              res.sendStatus(400);
            } else {
              next(err);
            }

            Profile. /** Remove unnecessary new profile */
            remove({ _id: profile._id  }).
            exec(function(err) {
              if (err) {
                debug(err);
              }
            });
          } else {

            new Contact({user: user._id}).

            save(function(err) {

              if (err) {
                next(err);
              } else {
                /** Send invite to the platform */
                res.redirect('/api/mandrill/invite/'+ user._id);

              }
            });
          }
        });
      });

    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Invited user Token validation
   */
  router.get('/invited/signin/:token', function(req, res , next) {

    Token.findById(req.params.token, function(err, token) {

      if (err) {

        if(err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (token) {

        req.session.token = token;

        res.send('Thanks for signing up, Please choose a password');

      } else {

        res.status(498).send('This token is not active anymore');
      }
    });

  });

  /**
   * Activation of invited user that already validated token
   */
  router.post('/invited/signin',  function(req, res , next) {

    var token = req.session.token,
        password = req.body.password;

    if (token.user && token.sender) {

      if (password) {

        User.findById(token.user, function(err, user) {

          if (err) {
            next(err);

          } else if (user) {

            user.password = password;

            user.state = statics.model('state', 'active')._id;

            user.save(function(err) {

              if (err) {
                next(err);

              } else {

                req.session.user = user;

                res.redirect('/api/contacts/confirm/'+token._id);

                delete req.session.token;

              }
            });

          } else {
            res.sendStatus(404);
          }
        });
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(403);
    }

  });


  /** 
   * Validate email of new user
   */
  router.get('/validate/:token', function (req, res, next) {

    Token.findById(req.params.token, function (err, token) {

      if (err) {

        if(err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (token) {

        User.

        findOneAndUpdate({
          _id: token.user
        },{
          state: statics.model('state', 'active')._id
        }).

        exec(function (err, user) {

          if (err) {
            next(err);

          } else {

            req.session.user = user;
            res.send(user._id);

            Token.remove({
              user: user._id
            }, function (err) {
              if (err) {
                debug('Error! : %s', err);
              }
            });
          }
        });
      } else {
        res.status(498).send('This token is not active anymore');
      }
    });

  });

  /**
   * Get the session user
   */
  router.get('/session', function (req, res, next) {

    User.

    findById(req.session.user._id).
    deepPopulate('profile.gender profile.pictures'). /* Retrieve data from linked schemas */

    exec(function (err, user) {

      if (err) {

        if(err.name && err.name === 'CastError') {

          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (user) {
        debug(user);
        res.send(user);

      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get a user and populate it's profile
   */
  router.get('/:id', function (req, res, next) {

    User.

    findById(req.params.id).
    deepPopulate('profile.gender profile.pictures'). /* Retrieve data from linked schemas */

    exec(function (err, user) {

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