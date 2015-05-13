/* jshint node: true */
/* global component */
'use strict';

var  _ = require('underscore'),
    debug = require('debug')('app:api:contacts');

var relations = component('relations'),
    statics = component('statics');

module.exports = function (router, mongoose) {

  var Contact = mongoose.model('contact'),
      Token = mongoose.model('token');

  /** 
   * Add contact
   */
  router.get('/add/:id', function (req, res, next) {

    var sender = null,
        receiver = null,
        senderIsContact,
        receiverIsContact;

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

              sender.save(function (err) {
                if (err) {
                  next(err);
                } else {

                  receiver.save(function (err) { 
                    if (err) {
                      next(err);
                    } else {

                      Token.
                      findOne().
                      where('user', receiver.user).
                      exec(function(err, token) {
                        if (err) {
                          next(err);

                        } else if (token) { /** The user is not part of emeeter and the invitation email is already been sent */

                          res.send('Great! You have invited a collaborator to emeeter'); 

                        } else { /** The user is part of emeeter and a contact request email is going to be sent */

                          res.redirect('/api/mandrill/addContact/' + receiver.user);

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
  router.get('/confirm/:token', function (req, res, next) {

    var sender = null,
        receiver = null,
        senderIsContact,
        receiverIsContact;

    Token.findById(req.params.token, function(err,token){

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

                  receiver.save(function (err) {
                    if (err) {
                      next(err);
                    } else {

                      sender.save(function (err) {
                        if (err) {
                          next(err);
                        } else {

                          debug('User %s and %s are now contacts!', receiver.user, sender.user);
                          res.send('User ' + receiver.user + ' and ' + sender.user + ' are now contacts!');

                          Token.remove({ _id: token._id}, function(err) { 
                            if(err) { 
                              debug(err);
                            }
                          });
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
  router.get('/delete/:id', function (req, res, next) { /** TODO: Delete contact request tokens */

    var sender = null,
        receiver = null,
        senderIsContact,
        receiverIsContact;

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

              receiver.save(function (err) {
                if (err) {
                  next(err);
                } else {

                  sender.save(function (err) {
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

                receiver.save(function (err) {
                  if (err) {
                    next(err);
                  } else {

                    sender.save(function (err) {
                      if (err) {
                        next(err);
                      } else {

                        debug('The contact request between %s and %s has been deleted!', receiver.user, sender.user);
                        res.send('The contact request between ' + receiver.user + ' and ' + sender.user + ' has been deleted!');

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
   * Get contacts of session user
   */ 
  router.get('/', function(req, res, next) {

    var checked = 0,
        toCheck = 0,
        toPopulate = 0,
        populated = 0,

        send = function (found) {

          if (checked === toCheck && populated === toPopulate) {
            res.send(found);
          }
        };

    Contact.

    findOne().

    where('user', req.session.user._id).

    exec(function(err, found) {

      if (err) {
        next(err);
      } else if (found.contacts.length) {

        toCheck = found.contacts.length;

        found.contacts.forEach(function(contact) {

          checked += 1;

          if (_.isEqual(contact.state, statics.model('state', 'active')._id)) {

            toPopulate += 1;

            contact.deepPopulate('user.profile', function(err) {

              if (err) {
                debug(err);

              } else {
                populated += 1;

                if (populated === toPopulate) {
                  send(found.contacts);
                }
              }
            }); 

          } else if (checked === toCheck) {
            send(found.contacts);
          }
        });

      } else {
        res.send(found.contacts);
      }
    });

  });

};