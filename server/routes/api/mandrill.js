'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill;
var debug = require('debug')('app:api:mandrill');

module.exports = function(router, mongoose) {

  var Token = mongoose.model('token');

  var senderEmail = "infoemeeter@gmail.com";
  var apiKey = 'DhTgCrDsRExbzSfSU-3dLw';
  var url = '192.168.0.112:3030';
  var sender = "emeeter";

  var api = null;

  (function connectToMandrill() {
    try {
      api = new Mandrill(apiKey);
      debug('Mandrill API initialized');
    } catch (err) {
      debug('Error! : %s', err);
    }
  })();

  /**
   * Send confirmation email.
   *
   * @type Express Middleware.
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

      message = {
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

      api.messages.send({
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
   * Send an email invitation to the emeeter platform.
   *
   * @type Express Middleware.
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

      api.messages.send({
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
   * Send an email with a reset password link.
   *
   * @type Express Middleware.
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

      api.messages.send({
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
