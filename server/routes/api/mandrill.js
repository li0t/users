'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill;
var debug = require('debug')('app:api:mandrill');
var apiKey = 'DhTgCrDsRExbzSfSU-3dLw';
var url = '192.168.0.112:3030';
var api = null;
var sender = "emeeter";
var senderEmail = "infoemeeter@gmail.com";

module.exports = function(router, mongoose) {

  var Interaction = mongoose.model('interaction');
  var Token = mongoose.model('token');
  var User = mongoose.model('user');

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
  router.post('/email-confirmation', function(req, res, next) {

    var email = req.body.email;
    var message;

    if (!api) {
      debug('A error occurred with the Mandrill client');
      return res.sendStatus(500);
    }

    Token.findById(req.body.token).

    exec(function(err, token) {
      if (err) {
        return next(err);
      }

      if (!token) {
        return res.sendStatus(400);
      }

      message = { /* Parameters to inject into Mandrill template */
        "html": "<a href='http://" + url + "/users/validate/" + token.secret + "'>Please confirm your email</a>",
        "text": "Bievenido a eMeeter",
        "subject": "Confirm your email",
        "from_email": senderEmail,
        "from_name": sender,
        "to": [{
          "email": email,
          "name": email,
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

  });

  /**
   * Send an invite
   */
  router.post('/user-invite', function(req, res, next) {

    var email = req.body.email;
    var message;

    if (!api) {
      debug('A error occurred with the Mandrill client');
      return res.sendStatus(500);
    }

    Token.findById(req.body.token).

    exec(function(err, token) {
      if (err) {
        return next(err);
      }

      if (!token) {
        return res.sendStatus(400);
      }

      message = {
        "html": "<a href='http://" + url + "/users/invited/validate/" + token.secret + "'/>Go to emeeter</a>",
        "text": "Have you tried emeeter? Check it now!",
        "subject": "emeeter invitation",
        "from_email": senderEmail,
        "from_name": req.session.user.email,
        "to": [{
          "email": email,
          "name": email,
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
        res.end();

      }, function(err) {
        debug('A mandrill error occurred %s : %s', +err.nam, err.message);
        res.sendStatus(500);
      });
    });

  });

  /**
   * Provide a reset password link
   */
  router.post('/user-recover', function(req, res, next) {

    var email = req.body.email;
    var message;

    if (!api) {
      debug('A error occurred with the Mandrill client');
      return res.sendStatus(500);
    }

    Token.findById(req.body.token).

    exec(function(err, token) {
      if (err) {
        return next(err);
      }

      if (!token) {
        return res.sendStatus(400);
      }

      message = {
        "html": "<a href='http://" + url + "/users/reset/" + token.secret + "'>Reset your password</a>",
        "text": "Reset your password",
        "subject": "Reset your password",
        "from_email": senderEmail,
        "from_name": sender,
        "to": [{
          "email": email,
          "name": email,
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

  });

};
