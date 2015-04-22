/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt'),
    _ = require('underscore'),
    debug = require('debug')('app:api:profiles'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };

module.exports = function (router, mongoose) {

  var User = mongoose.model('user'),
      Profile = mongoose.model('profile'),
      Contact = mongoose.model('contact'),
      Token = mongoose.model('token');

  /** 
   * Looks for statics states and saves the ids
   * FALLS WHEN THERE ARE NO STATICS INSTALLED
   */
  (function getStates() {
    var
    Sts = mongoose.model('static.state'),
        state;

    function lookup(name) {
      Sts.findOne({
        name: name
      }, function (err, found) {
        if (err) {
          debug('Error! : %s', err);
        } else {
          States[name] = found._id;
        }
      });
    }

    for (state in States) {
      if (States.hasOwnProperty(state)) {
        lookup(state);
      }
    }

  })();

  /** 
   * Get users list.
   */
  router.get('/', function (req, res, next) {

    User.find().

    where('state' , States.Active).

    exec(function (err, users) {
      if (err) {
        next(err);
      } else if (users && users.length) {
        res.send(users);
      } else {
        res.sendStatus(404);
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
          state: States.Pending,
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
                res.status(201).send(user._id); 
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

    /* Logout any previous user */
    delete req.session.user;
    delete req.session.workplace;

    /* Find the user by its email address */
    User.findOne().
    where('email', email).
    exec(function (err, user) {
      if (err) {
        next(err);
      } else if (user && bcrypt.compareSync(password, user.password)) { /* Check if there's a user and compare the passwords */

        if (_.isEqual(user.state, States.Active)) { /* Check if the user has confirmed it's email */

          req.session.user = user;
          res.send(user._id);

        } else if (_.isEqual(user.state, States.Pending)) {

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

  });

  /**
   * Logs a user out.
   */
  router.get('/logout', function (req, res, next) {

    delete req.session.user;

    res.end();

  });

  /**
   * Recover a user's password.
   */
  router.post('/recover', function (req, res, next) {

    /* Find the user by its email address, if any */
    User.findOne().
    where('email', req.body.email).  
    exec(function (err, user) {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/mandrill/recover/' + user._id);
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Changes user password
   */
  router.post('/changePassword', function (req, res, next) {

    var oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;

    if(newPassword !== oldPassword){

      User.findById(req.session.user._id).
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
      res.status(403).send('The new password should be different');
    }

  });

  /**
   * Disable the user's account
   */
  router.get('/disable', function (req, res, next) {

    User.findById(req.session.user._id, function (err, user) {
      if (err) {
        next(err);
      } else if (user) {

        user.state = States.Disabled;

        user.save(function(err){
          if(err){
            next(err);
          } else {
            delete req.session.user;
            res.sendStatus(204);
          }
        });
      } else {
        res.sendStatus(404);
      }
    });

  });

  /** 
   * Token validation
   */
  router.get('/validate/:token', function (req, res, next) {

    Token.findById(req.params.token, function (err, token) {
      if (err) {
        next(err);
      } else if (token) {

        User.findOneAndUpdate({
          _id: token.user
        },{
          state: States.Active
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
   * Get a user and renders it's profile
   */
  router.get('/:id', function (req, res, next) {

    User.findById(req.params.id).
    deepPopulate('state profile.gender profile.contacts profile.pictures'). /* Retrieves data from linked schemas */
    exec(function (err, user) {
      if (err) {
        next(err);
      } else if (user) {
        res.send(user);
      } else {
        res.sendStatus(404);
      }
    });

  });

};