/* jslint node: true */
'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill,
    debug = require('debug')('app:api:mandrill'),
    apiKey = 'DhTgCrDsRExbzSfSU-3dLw',
    url = 'localhost:3030',
    api = false,
    sender = "emeeter",
    senderEmail = "leonardo0ramos@gmail.com";


module.exports = function (router, mongoose) {

  var User = mongoose.model('user'),
      Token = mongoose.model('token');


  (function connectToMandrill() {
    try {
      api = new Mandrill(apiKey);
      debug('Mandrill API initialiced');
    } catch (err) {
      debug('Error! : %s', err);
    }
  })();

  /** 
   * List all users in this mandrill account 
   */
  router.get('/users', function (req, res, next) {

    if (api) {

      api.users.info({

      },function (users) {
        debug(users);

      },function (err) {
        debug('A mandrill error occurred %s : %s', + err.nam, err.message);
        res.status(500).end();
      });

    } else {
      debug('A error occurred with the Mandrill client');
      res.status(500).end();
    }

  });

  /**  
   * Send confirmation email 
   */
  router.get('/signin/:id', function (req, res, next) {

    if (api) {

      var message = null;

      User.findById(req.params.id, function (err, user) {
        if (err) {
          next(err);
        } else {

          Token.remove({ user: user._id }, function (err) { /* Remove any previous tokens assigned to the user */
            if (err){ debug(err); }
          });

          new Token({ /* Assign a new Token to the user */
            user: user._id
          }).save(function (err, token) {
            if (err) {
              next(err);
            } else {

              message = { /* Parameters to inject into Mandrill template */
                "html": "<a href='http://" + url + "/api/users/validate/" + token._id + "'>Please confirm your email</a>",
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

              }, function (result) {
                debug(result);
                res.send("You've been sent a confirmation email.");

              }, function (err) {
                debug('A mandrill error occurred %s : %s', + err.nam, err.message);
                res.status(500).end();
              });
            }
          });
        }
      });
    } else {
      debug('A error occurred with the Mandrill client');
      res.status(500).end();
    }

  });


  /**
   * Send a contact request
   */
  router.get('/addContact/:id', function (req, res, next) {

    if(api){

      var message = null;

      User.findById(req.params.id, function (err, user) {
        if (err) {
          next(err);
        } else if (user) {

          message = {
            "html": "<a href='http://" + url + "/api/users/" + user._id + "'>Go to emeeter</a>",
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
            "important": true
          };

          api.messages.send({ /* Send a confirmation email to the user */
            "message": message

          }, function (result) {
            debug(result);
            res.send("You have sent a contact request! Good!");

          }, function (err) {
            debug('A mandrill error occurred %s : %s', + err.nam, err.message);
            res.status(500).end();
          });
        } else {
          debug('A mandrill error occurred %s : %s', + err.nam, err.message);
          res.status(404).end();
        }
      });
    } else {
      debug('A error occurred with the Mandrill client');
      res.status(500).end();
    }
  });

};