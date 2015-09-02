'use strict';

var debug = require('debug')('app:api:contacts');
var _ = require('underscore');

var relations = component('relations');
var statics = component('statics');

module.exports = function(router, mongoose) {

  var Interaction = mongoose.model('interaction');
  var Contact = mongoose.model('contact');
  var Token = mongoose.model('token');

  /**
   * Get contacts of session user
   */
  router.get('/', function(req, res, next) {

    var contacts = [];

    Contact.findOne().

    where('user', req.session.user._id).

    deepPopulate('contacts.user.profile').

    exec(function(err, found) {

      if (err) {
        return next(err);

      }

      found.contacts.forEach(function(contact) {

        if (_.isEqual(contact.state, statics.model('state', 'active')._id)) {
          contacts.push(contact);

        }
      });

      res.send(contacts);

    });

  });

  /**
   * Add contact
   */
  router.post('/', function(req, res, next) {

    var receiverIsContact;
    var senderIsContact;
    var receiver = null;
    var sender = null;

    relations.contact(req.body.id, function(err, receiverRelation) {

      if (err || !receiverRelation.contact) {
        debug('No contacts list found for user with id %s', req.body.id);
        return res.sendStatus(404);
      }

      receiver = receiverRelation.contact; /** The contact model of the receiver user */

      relations.contact(req.session.user._id, function(err, senderRelation) {

        if (err || !senderRelation.contact) {
          debug('No contacts list found for user with id %s', req.session.user._id);
          return res.sendStatus(404);
        }

        sender = senderRelation.contact; /** The contact model of the sender user */

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
              return next(err);
            }

            receiver.save(function(err) {
              if (err) {
                return next(err);
              }
              res.send(receiver.user);

            });
          });
        } else if (_.isEqual(receiverIsContact.state, statics.model('state', 'active')._id)) { /** The contact state is Active */

          res.status(409).send('You are already contacts!');

        } else if (_.isEqual(receiverIsContact.state, statics.model('state', 'pending')._id)) { /** The contact state is Pending */

          res.status(409).send('Waiting for confirmation!');

        } else { /** The users were contacts, but in some point one of them disabled the relation */

          senderIsContact = receiverRelation.isContact(req.session.user._id, true);

          sender.contacts[receiverIsContact.index].state = statics.model('state', 'pending')._id;
          receiver.contacts[senderIsContact.index].state = statics.model('state', 'pending')._id;

          sender.save(function(err) {
            if (err) {
              return next(err);
            }

            receiver.save(function(err) {
              if (err) {
                return next(err);
              }

              res.send(receiver.user);

            });
          });
        }
      });
    });

  });

  /**
   *  Confirm request
   */
  router.put('/confirm/:token', function(req, res, next) {

    var receiverIsContact;
    var senderIsContact;
    var receiver = null;
    var sender = null;

    Interaction.findOne().

    where('token', req.params.token).

    exec(function(err, inter) {
      if (err) {
        if (err.name && err.name === 'CastError') {
          return res.sendStatus(400);
        }

        return next(err);
      }

      if (!inter || !inter.sender || !inter.receiver) {
        debug('Token %s not active', req.params.token);
        return res.sendStatus(498);
      }

      relations.contact(inter.receiver, function(err, receiverRelation) {

        if (err || !receiverRelation.contact) {
          debug('No contacts list found for user with id %s', inter.receiver);
          return res.sendStatus(404);
        }

        receiver = receiverRelation.contact;

        relations.contact(inter.sender, function(err, senderRelation) {

          if (err || !senderRelation.contact) {
            debug('No contacts list found for user with id %s', inter.sender);
            return res.sendStatus(404);
          }

          sender = senderRelation.contact;

          senderIsContact = receiverRelation.isContact(sender.user, true); /** True value allows to know if user is contact **/
          receiverIsContact = senderRelation.isContact(receiver.user, true); /** But in a pending state */

          if (!senderIsContact || !receiverIsContact) {
            return res.sendStatus(400);
          }

          receiver.contacts[senderIsContact.index].state = statics.model('state', 'active')._id;
          sender.contacts[receiverIsContact.index].state = statics.model('state', 'active')._id;

          receiver.save(function(err) {
            if (err) {
              return next(err);
            }

            sender.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('User %s and %s are now contacts!', receiver.user, sender.user);
              res.end();

              Token.remove({
                _id: inter.token
              }, function(err) {
                if (err) {
                  debug(err);
                }
              });

              inter.remove(function(err) {
                if (err) {
                  debug(err);
                }
              });
            });
          });
        });
      });
    });

  });

  /**
   * Delete a contact
   */
  router.delete('/:id', function(req, res, next) {

    var receiverIsContact;
    var senderIsContact;
    var receiver = null;
    var sender = null;

    relations.contact(req.params.id, function(err, receiverRelation) {

      if (err || !receiverRelation.contact) {
        debug('No contacts list found for user with id %s', req.params.id);
        return res.sendStatus(404);
      }

      receiver = receiverRelation.contact;

      relations.contact(req.session.user._id, function(err, senderRelation) {

        if (err || !senderRelation.contact) {
          debug('No contacts list found for user with id %s', req.session.user._id);
          return res.sendStatus(404);
        }

        sender = senderRelation.contact;

        senderIsContact = receiverRelation.isContact(sender.user);
        receiverIsContact = senderRelation.isContact(receiver.user);

        if (receiverIsContact) {

          receiver.contacts[senderIsContact.index].state = statics.model('state', 'disabled')._id;
          sender.contacts[receiverIsContact.index].state = statics.model('state', 'disabled')._id;

          receiver.save(function(err) {
            if (err) {
              return next(err);
            }

            sender.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('User %s and %s are no longer contacts!', receiver.user, sender.user);
              res.end();

            });

          });

        } else {

          senderIsContact = receiverRelation.isContact(sender.user, true);
          receiverIsContact = senderRelation.isContact(receiver.user, true);

          /** Check if the contact is present in a pending state */
          if (!receiverIsContact || !_.isEqual(receiverIsContact.state, statics.model('state', 'pending')._id)) {
            debug('User %s and %s are no contacts with each other!', receiver.user, sender.user);
            return res.sendStatus(400);
          }

          receiver.contacts[senderIsContact.index].state = statics.model('state', 'disabled')._id;
          sender.contacts[receiverIsContact.index].state = statics.model('state', 'disabled')._id;

          receiver.save(function(err) {
            if (err) {
              return next(err);
            }

            sender.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('The contact request between %s and %s has been deleted!', receiver.user, sender.user);
              res.end();

              /* Remove contact request token */
              Token.
              remove({
                user: receiver.user,
                sender: sender.user
              }).exec(function(err) {
                if (err) {
                  debug(err);
                }
              });

              Token.remove({
                user: sender.user,
                sender: receiver.user
              }).
              exec(function(err) {
                if (err) {
                  debug(err);
                }
              });
            });
          });
        }
      });
    });

  });

  /**
   * Get pending contact requests of session user
   */
  router.get('/pending', function(req, res, next) {

    var sessionUser = req.session.user._id;
    var contacts = [];
    var checked = 0;
    var toCheck = 0;

    function send() {

      if (checked === toCheck) {
        res.send(contacts);
      }
    }

    Contact.findOne().

    where('user', sessionUser).

    deepPopulate('contacts.user.profile').

    exec(function(err, found) {
      if (err) {
        return next(err);
      }

      if (found.contacts.length) {

        toCheck = found.contacts.length;

        found.contacts.forEach(function(contact) {

          checked += 1;

          if (_.isEqual(contact.state, statics.model('state', 'pending')._id)) {

            checked -= 1;

            Token.findOne().

            where('user', sessionUser).
            where('sender', contact.user._id).

            exec(function(err, token) {
              if (err) {
                debug(err);
              }

              if (token) {

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

};
