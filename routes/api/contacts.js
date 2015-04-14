/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt'),
  _ = require('underscore');

module.exports = function (router, mongoose) {

  var Contact = mongoose.model('contact'),
    User = mongoose.model('user'),
    Token = mongoose.model('token'),
    States = {
      Active: null,
      Pending: null,
      Inactive: null
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
   * Add contact
   */
  router.get('/add/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, user) { /* The user recieving the request */
      if (err) {
        next(err);
      } else if (user) {
        Contact.find().where('user', user._id).exec(function (err, receiver) { /* The ContactSchema of the receiver */
          if (err) {
            next(err)
          } else {
            if (receiver) {
              Contact.find().where('user', req.session.user._id).exec(function (err, sender) { /* The ContactSchema of the sender */
                if (err) {
                  next(err)
                } else {
                  if (sender) {
                    sender.contacts.push({ /* Pushes the receiver id into the sender contacts */
                      _id: user._id,
                      state: States.Pending
                    });
                    receiver.contacts.push({ /* Pushes the sender id into the receiver contacts */
                      _id: req.session.user._id,
                      state: States.Pending
                    });
                    sender.save(function (err) {
                      if (err) {
                        next(err);
                      } else {
                        receiver.save(function (err) {
                          if (err) {
                            next(err);
                          } else {
                            //res.redirect('/api/notifications/pending/' + user._id); /* if done, redirects to notifications api */
                            res.redirect('api/mandrill/addContact/'+user._id);
                          }
                        });
                      }
                    });
                  } else {
                    res.status(404).end();
                  }
                }
              });
            } else {
              res.status(404).end();
            }
          }
        });
      } else {
        res.status(404).end();
      }
    });
  });

  /** 
   *  Confirm request
   */
  router.get('confirm/:id', function (req, res, next) {
    Contact.find().where('user', req.params.id).exec(function (err, sender) {
      if (err) {
        next(err);
      } else if (sender) {
        Contact.find().where('user', req.session.user._id).exec(function (err, receiver) {
          if (err) {
            next(err);
          } else if (receiver) {
            for (var i = 0; i < sender.contacts.length; i++) {
              if (JSON.stringify(sender.contacs[i].user) === req.session.user._id) {
                sender.contacts[i]._state = States.Active;
                break;
              }
            }
            for (i = 0; i < receiver.contacts.length; i++) {
              if (JSON.stringify(receiver.contacs[i].user) === req.params.id) {
                receiver.contacts[i]._state = States.Active;
                break;
              }
            }
            sender.save(function (err) {
              if (err) {
                next(err); -
              } else {
                receiver.save(function (err) {
                  if (err) {
                    next(err)
                  } else {
                    res.status(200).send(receiver);
                  }
                });
              }
            })
          } else {
            res.status(404).end();
          }
        });
      } else {
        res.status(404).end();
      }
    });

  });

}