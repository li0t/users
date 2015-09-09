'use strict';

var debug = require('debug')('app:api:interactions');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var Interaction = mongoose.model('interaction');
  var Token = mongoose.model('token');
  var Task = mongoose.model('task');
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

  router.post('/group-invite', function(req, res, next) {


    new Interaction({
      action: statics.model('action', 'group-invite')._id,
      modelRelated: req.body.group,
      sender: req.session.user._id,
      receiver: req.body.receiver
    }).
    save(function(err, data) {
      if (err) {
        return next(err);
      }

      res.status(201).send(data);

    });

  });

  router.post('/task-assigned', function(req, res, next) {

    new Interaction({
      action: statics.model('action', 'task-assigned')._id,
      sender: req.session.user._id,
      modelRelated: req.body.task,
      receiver: req.body.receiver
    }).
    save(function(err, data) {
      if (err) {
        return next(err);
      }

      res.status(201).send(data);

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

  router.post('/task-expired-one-week', function(req, res, next) {

    debug(req.body);

    Task.findById(req.body.task).

    exec(function(err, task) {
      if (err) {
        return next(err);
      }

      if (!task) {
        return res.sendStatus(400);
      }

      task.collaborators.forEach(function(collaborator) {

        new Interaction({
          action: statics.model('action', 'task-expired-one-week')._id,
          receiver: collaborator.user,
          modelRelated: task._id
        }).
        save(function(err) {
          if (err) {
            debug(err);
          }
        });
      });
    });

  });

};
