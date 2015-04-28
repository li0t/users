/* jshint node: true */
'use strict';

var  _ = require('underscore'),
    debug = require('debug')('app:api:contacts'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };

module.exports = function (router, mongoose) {

  var Contact = mongoose.model('contact'),
      Token = mongoose.model('token');

  /** 
   * Looks for statics states and saves the ids
   */
  (function getStates() {
    var Sts = mongoose.model('static.state'),
        state;

    function lookup(name) {

      Sts.findOne({ name: name }, function (err, found) {
        if (err) {
          debug('Error! : %s', err);
        } else if(found) {
          States[name] = found._id;
        } else {
          debug('No state found with name %s', name);
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

    var i, isContact, contactState;

    Contact.findOne().
    where('user', req.session.user._id).
    exec(function (err, sender) { /* The ContactSchema of the sender */
      if (err) {
        if(err.name && err.name === 'CastError'){
          res.sendStatus(400);
        } else {
          next(err);
        }
      } else {
        if (sender) {

          for (i = 0; i < sender.contacts.length; i++) {
            if (JSON.stringify(sender.contacts[i].user) === JSON.stringify(req.params.id)) {
              isContact = true;
              contactState = sender.contacts[i].state;
              break;
            }
          }

          if(!isContact){
            Contact.findOne().
            where('user', req.params.id).
            exec(function (err, receiver) { /* The ContactSchema of the receiver */
              if (err) {
                next(err);
              } else {
                if (receiver) {


                  sender.contacts.push({ /* Pushes the receiver id into the sender contacts */
                    user: req.params.id,
                    state: States.Pending /* The contact state is pending for confirmation */
                  });

                  receiver.contacts.push({ /* Pushes the sender id into the receiver contacts */
                    user: req.session.user._id,
                    state: States.Pending /* The contact state is pending for confirmation */
                  });

                  sender.save(function (err) {
                    if (err) {
                      next(err);
                    } else {

                      receiver.save(function (err) { 
                        if (err) {
                          next(err);
                        } else {
                          res.send('Great! Send the email to generate token'); 
                        }
                      });
                    }
                  });
                } else {
                  debug('No contacs list found for user with id %s', req.session.user._id);
                  res.sendStatus(404);
                }
              }
            });
          } else {
            if(_.isEqual(contactState, States.Active)){
              res.send('You are already contacts!');
            } else {
              res.send('Waiting for confirmation...');
            }
          }
        } else {
          debug('No contacs list found for user with id %s', req.params.id);
          res.sendStatus(404);
        }
      }
    });

  });

  /** 
   *  Confirm request
   */
  router.get('/confirm/:token', function (req, res, next) {

    Token.findById(req.params.token, function(err,token){

      if (err) {
        if(err.name && err.name === 'CastError'){
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if(token && token.sender){

        Contact.
        findOne().
        where('user', token.sender).
        exec(function (err, sender) {
          if (err) {
            next(err);
          } else if (sender) {

            Contact.
            findOne().
            where('user', req.session.user._id). 
            exec(function (err, receiver) {
              if (err) {
                next(err);
              } else if (receiver) {

                for (var i = 0; i < sender.contacts.length; i++) {
                  if (JSON.stringify(sender.contacts[i].user) === JSON.stringify(req.session.user._id)) {
                    sender.contacts[i].state = States.Active;
                    break;
                  }
                }

                for (i = 0; i < receiver.contacts.length; i++) {
                  if (JSON.stringify(receiver.contacts[i].user) === JSON.stringify(token.sender)) {
                    receiver.contacts[i].state = States.Active;
                    break;
                  }
                }

                sender.save(function (err) {
                  if (err) {
                    next(err);
                  } else {

                    receiver.save(function (err) {
                      if (err) {
                        next(err);
                      } else {
                        
                        res.sendStatus(204);

                        Token.remove({_id : token._id}, function(err) {
                          if (err) {
                            debug('Error! ' + err); 
                          }
                        }); 
                      }
                    });
                  }
                });
              } else {
                res.sendStatus(404);
              }
            });
          } else {
            res.sendStatus(404);
          }
        });
      } else {
        res.status(498).send('No active token found.');
      }
    });

  });

  /**
   * Delete a contact
   */
  router.get('/delete/:id', function (req, res, next) {

    Contact.findOne().
    where('user', req.params.id).
    exec(function (err, contact) {
      if (err) {
        if(err.name && err.name === 'CastError'){
          res.sendStatus(400);
        } else {
          next(err);
        }
      } else if (contact) {

        Contact.findOne().
        where('user', req.session.user._id).
        exec(function (err, user) {
          if (err) {
            next(err);
          } else if (user) {

            for (var i = 0; i < contact.contacts.length; i++) {
              if (JSON.stringify(contact.contacts[i].user) === JSON.stringify(req.session.user._id)) {
                contact.contacts[i].state = States.Disabled;
                break;
              }
            }

            for (i = 0; i < user.contacts.length; i++) {
              if (JSON.stringify(user.contacts[i].user) === JSON.stringify(req.params.id)) {
                user.contacts[i].state = States.Disabled;
                break;
              }
            }

            contact.save(function (err) {
              if (err) {
                next(err);
              } else {

                user.save(function (err) {
                  if (err) {
                    next(err);
                  } else {
                    res.sendStatus(204);
                  }
                });
              }
            });
          } else {
            res.sendStatus(404);
          }
        });
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get contacts of session user
   */ 
  router.get('/', function(req, res, next){

    var checked = 0,
        toCheck = 0,
        toPopulate = 0,
        populated = 0,

        send = function (found) {

          if (checked === toCheck && populated === toPopulate) {
            res.send(found);
          }
        };

    Contact.findOne().

    where('user', req.session.user._id).

    exec(function(err, found) {

      if (err) {
        next(err);
      } else if(found.contacts.length) {

        toCheck = found.contacts.length;

        found.contacts.forEach(function(contact) {

          checked +=1;

          if (_.isEqual(contact.state, States.Active)) {

            toPopulate +=1;

            contact.deepPopulate('user.profile', function(err) {

              if(err) {
                debug(err);

              } else {
                populated +=1;

                if (populated === toPopulate) {
                  send(found);
                }
              }
            }); 

          } else if (checked === toCheck) {
            send(found);
          }
        });

      } else {
        res.sendStatus(404);
      }
    });

  });

};