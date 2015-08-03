'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill;
var debug = require('debug')('app:api:mandrill');
var apiKey = 'DhTgCrDsRExbzSfSU-3dLw';
var url = '192.168.0.112:3030';
var api = null;
var sender = "emeeter";
var senderEmail = "infoemeeter@gmail.com";

module.exports = function(router, mongoose) {

  var User = mongoose.model('user');
  var Token = mongoose.model('token');

  (function connectToMandrill() {
    try {
      api = new Mandrill(apiKey);
      debug('Mandrill API initialized');
    } catch (err) {
      debug('Error! : %s', err);
    }
  })();

  /**
   * List all users in this mandrill account
   */
  router.get('/users', function(req, res /*, next*/ ) {

    if (api) {

      api.users.info({

      }, function(users) {
        debug(users);

      }, function(err) {
        debug('A mandrill error occurred %s : %s', +err.nam, err.message);
        res.sendStatus(500);
      });

    } else {
      debug('A error occurred with the Mandrill client');
      res.sendStatus(500);
    }

  });

  /**
   * Send confirmation email
   */
  router.post('/signup', function(req, res, next) {

    if (api) {

      var message = null;

      User.findById(req.body.id, function(err, user) {

        if (err) {
          return next(err);
        }

        if (user) {

          Token.remove({
            user: user._id
          });

          new Token({
            user: user._id
          }). /* Assign a new Token to the user */

          save(function(err, token) {
            if (err) {
              return next(err);
            }

            message = { /* Parameters to inject into Mandrill template */
              "html": "<a href='http://" + url + "/users/validate/" + token._id + "'>Please confirm your email</a>",
              "text": "Bievenido a eMeeter",
              "subject": "Confirm your email",
              "from_email": senderEmail,
              "from_name": sender,
              "to": [{
                "email": user.email,
                "name": user.email,
                "type": "to"
              }],
              "headers": {
                "Reply-To": "noreply@emeeter.com"
              },
              "track_opens": true,
              "track_clicks": true,
              "important": true

            };

            api.messages.send({ /* Send a confirmation email to the user */
              "message": message

            }, function(result) {
              debug(result);
              res.end();

            }, function(err) {
              debug('A mandrill error occurred %s : %s', +err.nam, err.message);
              res.status(500).send(err);
            });
          });
        } else {
          debug('No user found with id %s ', +req.params.id);
          res.sendStatus(404);
        }
      });
    } else {
      debug('A error occurred with the Mandrill client');
      res.sendStatus(500);
    }

  });


  /**
   * Send a contact request
   */
  router.post('/addContact', function(req, res, next) {

    if (api) {

      var message = null;

      User.findById(req.body.id, function(err, user) {
        if (err) {
          return next(err);
        }

        if (user) {

          new Token({ /** Create token to allow contact confirmation */
            user: user._id,
            sender: req.session.user._id
          }).

          save(function(err) {
            if (err) {
              return next(err);
            }

            message = {
              "html": "<a href='http://" + url + "/'>Go to emeeter</a>",
              "text": "Someone wants to contact you",
              "subject": "Someone wants to contact you",
              "from_email": senderEmail,
              "from_name": sender,
              "to": [{
                "email": user.email,
                "name": user.email,
                "type": "to"
              }],
              "headers": {
                "Reply-To": "noreply@emeeter.com"
              },
              "track_opens": true,
              "track_clicks": true,
              "important": false
            };

            api.messages.send({ /* Send a confirmation email to the user */
              "message": message

            }, function(result) {
              debug(result);
              res.end();

            }, function(err) {
              debug('A mandrill error occurred %s : %s', +err.nam, err.message);
              res.sendStatus(500);
            });
          });
        } else {
          debug('No user found with id %s ', +req.params.id);
          res.sendStatus(404);
        }
      });
    } else {
      debug('A error occurred with the Mandrill client');
      res.sendStatus(500);
    }

  });

  /**
   * Send an invite
   */
  router.post('/invite', function(req, res, next) {

    if (api) {

      var message = null;

      User.findById(req.body.id, function(err, user) {
        if (err) {
          return next(err);
        }

        if (user) {

          new Token({
            user: user._id,
            sender: req.session.user._id
          }).

          save(function(err, token) {
            if (err) {
              return next(err);
            }

            message = {
              "html": "<a href='http://" + url + "/users/invited/validate/" + token._id + "'/>Go to emeeter</a>",
              "text": "Have you tried emeeter? Check it now!",
              "subject": "emeeter invitation",
              "from_email": senderEmail,
              "from_name": req.session.user.email,
              "to": [{
                "email": user.email,
                "name": user.email,
                "type": "to"
              }],
              "headers": {
                "Reply-To": "noreply@emeeter.com"
              },
              "track_opens": true,
              "track_clicks": true,
              "important": false
            };

            api.messages.send({ /* Send a invite email*/
              "message": message

            }, function(result) {
              debug(result);
              res.send(user._id);

            }, function(err) {
              debug('A mandrill error occurred %s : %s', +err.nam, err.message);
              res.sendStatus(500);
            });
          });
        } else {
          debug('No user found with id %s ', +req.params.id);
          res.sendStatus(404);
        }
      });
    } else {
      debug('A error occurred with the Mandrill client');
      res.sendStatus(500);
    }

  });

  /**
   * Provide a reset password link
   */
  router.get('/recover/:email', function(req, res, next) {

    if (api) {

      var message;

      User.findOne().

      where('email', req.params.email).

      exec(function(err, user) {
        if (err) {
          return next(err);
        }

        if (user) {

          new Token({
            user: user._id
          }).

          save(function(err, token) {
            if (err) {
              return next(err);
            }

            message = {
              "html": "<a href='http://" + url + "/users/recover/" + token._id + "'>Reset your password</a>",
              "text": "Reset your password",
              "subject": "Reset your password",
              "from_email": senderEmail,
              "from_name": sender,
              "to": [{
                "email": user.email,
                "name": user.email,
                "type": "to"
              }],
              "headers": {
                "Reply-To": "noreply@emeeter.com"
              },
              "track_opens": true,
              "track_clicks": true,
              "important": false
            };

            api.messages.send({ /* Send a recovery email to the user */
              "message": message

            }, function(result) {
              debug(result);
              res.end();

            }, function(err) {
              debug('A mandrill error occurred %s : %s', +err.nam, err.message);
              res.sendStatus(500);
            });

          });
        } else {
          debug('No user found for ' + req.params.email);
          res.sendStatus(400);
        }
      });
    } else {
      debug('A error occurred with the Mandrill client');
      res.sendStatus(500);
    }

  });

};
