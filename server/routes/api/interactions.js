'use strict';

var debug = require('debug')('app:api:interactions');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var Interaction = mongoose.model('interaction');
  var Token = mongoose.model('token');
  var User = mongoose.model('user');

  router.post('/email-confirmation', function(req, res, next) {

    new Token().
    save(function(err, token) {
      if (err) {
        return next(err);
      }

      new Interaction({
        action: statics.model('action', 'email-confirmation')._id,
        receiver: req.body.user,
        token: token._id
      }).
      save(function(err, data) {
        if (err) {
          token.remove(function(err) {
            if (err) {
              debug(err);
            }
          });
          return next(err);
        }

        res.status(201).send(data);

      });
    });

  });

  router.post('/user-invite', function(req, res, next) {

    new Token().
    save(function(err, token) {
      if (err) {
        return next(err);
      }

      new Interaction({
        action: statics.model('action', 'user-invite')._id,
        sender: req.session.user._id,
        receiver: req.body.receiver,
        token: token._id
      }).
      save(function(err, data) {
        if (err) {
          token.remove(function(err) {
            if (err) {
              debug(err);
            }
          });
          return next(err);
        }

        res.status(201).send(data);

      });
    });

  });

  router.post('/contact-request', function(req, res, next) {

    new Token().
    save(function(err, token) {
      if (err) {
        return next(err);
      }

      new Interaction({
        action: statics.model('action', 'contact-request')._id,
        sender: req.session.user._id,
        receiver: req.body.receiver,
        token: token._id
      }).
      save(function(err, data) {
        if (err) {
          token.remove(function(err) {
            if (err) {
              debug(err);
            }
          });
          return next(err);
        }

        res.status(201).send(data);

      });
    });

  });

  router.post('/user-recover', function(req, res, next) {

    User.findOne().

    where('email', req.body.email).

    exec(function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.sendStatus(400);
      }

      new Token().
      save(function(err, token) {
        if (err) {
          return next(err);
        }

        new Interaction({
          action: statics.model('action', 'user-recover')._id,
          receiver: user._id,
          token: token._id
        }).
        save(function(err, data) {
          if (err) {
            token.remove(function(err) {
              if (err) {
                debug(err);
              }
            });
            return next(err);
          }

          res.status(201).send(data);

        });
      });
    });

  });


};
