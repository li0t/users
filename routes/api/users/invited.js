/* jshint node: true */
/* global component */
'use strict';

var bcrypt = require('bcrypt');
var _ = require('underscore');
var debug = require('debug')('app:api:users:invited');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var User = mongoose.model('user');
  var Profile = mongoose.model('profile');
  var Contact = mongoose.model('contact');
  var Token = mongoose.model('token');

  /**
   * Create a new user and invite it to emeeter
   */
  router.get('/createAndInvite/:email', function(req, res, next) {

    var email = req.params.email;

    if (email) {

      new Profile().
      save(function(err, profile) {

        new User({
          email: email,
          password: Math.random().toString(36).slice(-8),
          /** Randomized alphanumeric password */
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
                } else if (user) {
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
            remove({
              _id: profile._id
            }).
            exec(function(err) {
              if (err) {
                debug(err);
              }
            });
          } else {

            new Contact({
              user: user._id
            }).

            save(function(err) {

              if (err) {
                next(err);
              } else {
                /** Send invite to the platform */
                res.redirect('/api/mandrill/invite/' + user._id);

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
   * Activation of invited user that already validated token
   */
  router.post('/invited/signin/:token', function(req, res, next) {

    var token = req.session.token;
    var password = req.body.password;

    Token.findById(req.params.token, function(err, token) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (token && token.user && token.sender) {

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

                  res.redirect('/api/contacts/confirm/' + token._id);

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
        res.sendStatus(498);
      }
    });

  });

};
