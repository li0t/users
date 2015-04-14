/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt'),
  _ = require('underscore');

module.exports = function (router, mongoose) {

  var User = mongoose.model('user'),
    Profile = mongoose.model('profile'),
    Contact = mongoose.model('contact'),
    Token = mongoose.model('token'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };

  /** 
   * Looks for statics states and saves the ids
   *
   * FALLS WHEN THERE ARE NO STATICS INSTALLED
   */
  (function getStates() {
    var
      Sts = mongoose.model('static.state'),
      state;

    function lookup(name) {
      Sts.find({
        name: name
      }, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          States[name] = result[0]._id;
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
    User.find(function (err, users) {
      if (err) {
        next(err);
      }
      if (users.length === 0) {
        res.send('The are no users');
      }
      res.send(users);
    });
  });

  /** 
   * Create a new user
   */
  router.post('/create', function (req, res, next) {

    new Profile()
      .save(function (err, profile) { /* Create a new Profile that will store the user information */
        if (err) {
          next(err);
        } else {
          new User({
            email: req.body.email,
            password: req.body.password,
            profile: profile._id,
            state: States.Pending,
          }).save(function (err, user) {
            if (err) {
              /* Check for duplicated entry */
              if (err.code && err.code === 11000) {
                res.status(409).end();
              } else if (err.name && err.name === 'ValidationError') {
                res.status(400).end();
              } else {
                next(err);
              }
            } else {
              new Contact({ /* Create a new ContactSchema that will store the user contacts */
                user: user._id
              }).save(function (err) {
                if (err) {
                  next(err)
                } else {
                  res.status(201).redirect('/api/mandrill/signin/' + user._id); /* call the email manager */
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
    User.findOne()
      .where('email', email)
      .exec(function (err, user) {
        if (err) {
          next(err);
        } else if (user && bcrypt.compareSync(password, user.password)) { /* Check if there's a user and compare the passwords */
          if (_.isEqual(user.state, States.Active)) {
            req.session.user = user;
            res.redirect('/api/users/' + user._id);
          } else if (_.isEqual(user.state, States.Pending)) {
            res.send("Looks like you havent confirmed your email yet.");
          } else {
            res.send("Looks like you have disabled your account.");
          }
        } else {
          setTimeout(function () {
            res.status(401).end();
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
    User.findOne()
      .where('email', req.body.email)
      .exec(function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/mandrill/recover/' + user._id);
        } else {
          res.status(400).end();
        }
      });

  });




  /**
   * Changes user password
   */
  router.post('/changePassword', function (req, res, next) {

    var oldPassword = req.body.oldPassword,
      newPassword = req.body.newPassword;

    User.findById(req.session.user._id)
      .deepPopulate('contacts profile.gender profile.pictures') /* Retrieves data from linked schemas */
      .exec(function (err, user) {
        if (err) {
          next(err);
        } else if (user && bcrypt.compareSync(oldPassword, user.password)) { /* Check if there's a user and compare the passwords */
          user.password = newPassword;
          user.save(function (err, user) {
            req.session.user = user;
            res.redirect('/api/users/' + user._id);
          });
        } else {
          setTimeout(function () {
            res.status(401).end();
          }, 1000);
        }
      });

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
        delete req.session.user;
        res.redirect('/');
      } else {
        res.status.(404).end();
      }
    })
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
          }, {
            state: States.Active
          })
          .exec(function (err, user) {
            if (err) {
              next(err);
            } else {
              Token.remove({
                user: user._id
              }, function (err) {
                if (err) {
                  console.log('Error! ' + err);
                }
              });
              req.session.user = user;
              res.redirect('/api/users/' + user._id);
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
    User.findById(req.params.id)
      .deepPopulate('profile.gender profile.contacts') /* Retrieves data from linked schemas */
      .exec(function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.status(200).send(user);
        } else {
          res.status(400).end();
        }
      });
  });


};