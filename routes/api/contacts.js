/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore');
var debug = require('debug')('app:api:contacts');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var Contact = mongoose.model('contact');
  var Token = mongoose.model('token');
  var User = mongoose.model('user');

  /**
   * Add contact
   */
  router.get('/add/:id', function(req, res, next) {

    var sender = null;
    var receiver = null;
    var senderIsContact;
    var receiverIsContact;

    relations.contact(req.params.id, function(receiverRelation) {

      receiver = receiverRelation.contact; /** The contact model of the receiver user */

      if (receiver) {

        relations.contact(req.session.user._id, function(senderRelation) {

          sender = senderRelation.contact; /** The contact model of the sender user */

          if (sender) {

            receiverIsContact = senderRelation.isContact(receiver.user, true);

            if (!receiverIsContact) { /** Check if the users are contacts already */

              sender.contacts.push({
                user: receiver.user,
                state: statics.model('state', 'pending')._id
              });
              /** Push each other id's and set te the contact as pending*/
              receiver.contacts.push({
                user: sender.user,
                state: statics.model('state', 'pending')._id
              });

              sender.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  receiver.save(function(err) {
                    if (err) {
                      next(err);
                    } else {

                      User.
                      findById(receiver.user).
                      exec(function(err, user) {
                        if (err) {
                          next(err);

                        } else {

                          /** The user was not part of the emeeter platform, and is in a pending state */
                          if (_.isEqual(user.state, statics.model('state', 'pending')._id)) {

                            res.send('Great! You have invited a collaborator to emeeter');

                          } else { /** The user is part of emeeter and a contact request email is going to be sent */

                            res.redirect('/api/mandrill/addContact/' + receiver.user);

                          }
                        }
                      });
                    }
                  });
                }
              });

            } else if (_.isEqual(receiverIsContact.state, statics.model('state', 'active')._id)) { /** The contact state is Active */

              res.send('You are already contacts!');

            } else if (_.isEqual(receiverIsContact.state, statics.model('state', 'pending')._id)) { /** The contact state is Pending */

              res.send('Waiting for confirmation!');

            } else { /** The users were contacts, but in some point one of them disabled the relation */

              senderIsContact = receiverRelation.isContact(req.session.user._id, true);

              sender.contacts[receiverIsContact.index].state = statics.model('state', 'pending')._id;
              receiver.contacts[senderIsContact.index].state = statics.model('state', 'pending')._id;

              sender.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  receiver.save(function(err) {
                    if (err) {
                      next(err);
                    } else {

                      res.redirect('/api/mandrill/addContact/' + receiver.user);

                    }
                  });
                }
              });
            }
          } else {
            debug('No contacts list found for user with id %s', req.session.user._id);
            res.sendStatus(404);
          }
        });
      } else {
        debug('No contacts list found for user with id %s', req.params.id);
        res.sendStatus(404);
      }
    });

  });

  /**
   *  Confirm request
   */
  router.get('/confirm/:token', function(req, res, next) {

    var sender = null;
    var receiver = null;
    var senderIsContact;
    var receiverIsContact;

    Token.findById(req.params.token, function(err, token) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (token && token.sender) {

        relations.contact(token.user, function(receiverRelation) {

          receiver = receiverRelation.contact;

          if (receiver) {

            relations.contact(token.sender, function(senderRelation) {

              sender = senderRelation.contact;

              if (sender) {

                senderIsContact = receiverRelation.isContact(sender.user, true);
                receiverIsContact = senderRelation.isContact(receiver.user, true);

                if (senderIsContact && receiverIsContact) {

                  receiver.contacts[senderIsContact.index].state = statics.model('state', 'active')._id;
                  sender.contacts[receiverIsContact.index].state = statics.model('state', 'active')._id;

                  receiver.save(function(err) {
                    if (err) {
                      next(err);
                    } else {

                      sender.save(function(err) {
                        if (err) {
                          next(err);
                        } else {

                          debug('User %s and %s are now contacts!', receiver.user, sender.user);
                          res.send('User ' + receiver.user + ' and ' + sender.user + ' are now contacts!');

                          token.remove();
                        }
                      });
                    }
                  });
                } else {
                  res.sendStatus(400);
                }
              } else {
                debug('No contacts list found for user with id %s', req.session.user._id);
                res.sendStatus(404);
              }
            });
          } else {
            debug('No contacts list found for user with id %s', req.params.id);
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
  router.get('/delete/:id', function(req, res, next) { /** TODO: Delete contact request tokens */

    var sender = null;
    var receiver = null;
    var senderIsContact;
    var receiverIsContact;

    relations.contact(req.params.id, function(receiverRelation) {

      receiver = receiverRelation.contact;

      if (receiver) {

        relations.contact(req.session.user._id, function(senderRelation) {

          sender = senderRelation.contact;

          if (sender) {

            senderIsContact = receiverRelation.isContact(sender.user);
            receiverIsContact = senderRelation.isContact(receiver.user);

            if (receiverIsContact) {

              receiver.contacts[senderIsContact.index].state = statics.model('state', 'disabled')._id;
              sender.contacts[receiverIsContact.index].state = statics.model('state', 'disabled')._id;

              receiver.save(function(err) {
                if (err) {
                  next(err);
                } else {

                  sender.save(function(err) {
                    if (err) {
                      next(err);
                    } else {

                      debug('User %s and %s are no longer contacts!', receiver.user, sender.user);
                      res.send('User ' + receiver.user + ' and ' + sender.user + ' are no longer contacts!');

                    }
                  });
                }
              });

            } else {

              senderIsContact = receiverRelation.isContact(sender.user, true);
              receiverIsContact = senderRelation.isContact(receiver.user, true);

              /** Check if the contact is present in a pending state */
              if (receiverIsContact && _.isEqual(receiverIsContact.state, statics.model('state', 'pending')._id)) {

                receiver.contacts[senderIsContact.index].state = statics.model('state', 'disabled')._id;
                sender.contacts[receiverIsContact.index].state = statics.model('state', 'disabled')._id;

                receiver.save(function(err) {
                  if (err) {
                    next(err);
                  } else {

                    sender.save(function(err) {
                      if (err) {
                        next(err);
                      } else {

                        debug('The contact request between %s and %s has been deleted!', receiver.user, sender.user);
                        res.send('The contact request between ' + receiver.user + ' and ' + sender.user + ' has been deleted!');

                        /**
                         * Remove contact request token
                         */
                        Token.
                        remove({
                          user: receiver.user,
                          sender: sender.user
                        }).
                        exec(function(err, removed) {
                          if (err) {
                            debug(err);
                          } else if (removed) {
                            debug('contact request token with user %s and sender %s has been removed', receiver.user, sender.user);
                          }
                        });

                        Token.
                        remove({
                          user: sender.user,
                          sender: receiver.user
                        }).
                        exec(function(err, removed) {
                          if (err) {
                            debug(err);
                          } else if (removed) {
                            debug('contact request token with user %s and sender %s has been removed', receiver.user, sender.user);
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                debug('User %s and %s are no contacts with each other!', receiver.user, sender.user);
                res.sendStatus(400);
              }
            }
          } else {
            debug('No contacts list found for user with id %s', req.session.user._id);
            res.sendStatus(404);
          }
        });
      } else {
        debug('No contacts list found for user with id %s', req.params.id);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get pending contact requests of session user
   */
  router.get('/pending', function(req, res, next) {

    var sessionUser = req.session.user._id;
    var checked = 0;
    var toCheck = 0;
    var contacts = [];

    function send() {

      if (checked === toCheck) {
        res.send(contacts);
      }
    }

    Contact.

    findOne().

    where('user', sessionUser).

    deepPopulate('contacts.user').

    exec(function(err, found) {

      if (err) {
        next(err);

      } else if (found.contacts.length) {

        toCheck = found.contacts.length;

        found.contacts.forEach(function(contact) {

          checked += 1;

          if (_.isEqual(contact.state, statics.model('state', 'pending')._id)) {

            checked -= 1;

            Token.
            findOne().
            where('user', sessionUser).
            where('sender', contact.user._id).
            exec(function(err, token) {

              if (err) {
                debug(err);

              } else if (token) {

                contact = contact.user.toObject();
                contact.token = token._id;
                contacts.push(contact);

              }

              checked += 1;

              if (checked === toCheck) {

                send();

              }
            });
          } else if (checked === toCheck) {

            send();

          }
        });

      } else {
        res.send(found.contacts);
      }
    });

  });

  /**
   * Get contacts of session user
   */
  router.get('/', function(req, res, next) {

    var contacts = [];

    Contact.

    findOne().

    where('user', req.session.user._id).

    deepPopulate('contacts.user').

    exec(function(err, found) {
      if (err) {
        next(err);

      } else {

        found.contacts.forEach(function(contact) {

          if (_.isEqual(contact.state, statics.model('state', 'active')._id)) {

            contacts.push(contact.user);

          }
        });

        res.send(contacts);

      }
    });

  });

};
