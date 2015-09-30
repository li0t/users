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
   * Get Contacts of session User.
   *
   * @type Express Middleware.
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
   * Get pending contact requests of session User.
   *
   * @type Express Middleware.
   */
  router.get('/pending', function(req, res, next) {

    Interaction.find().

    where('action', statics.model('action', 'contact-request')._id).
    where('receiver', req.session.user._id).

    deepPopulate('sender.profile').

    exec(function(err, reqs) {
      if (err) {
        return next(err);
      }

      res.send(reqs);
    });

  });

  /**
   * Create contact request.
   * This is done by adding the receiver User to the session User contacts list
   * and vice-versa, both in a pending state. In case they were contacts in the
   * past change both contacts state to pending.
   *
   * @type Express Middleware.
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

        /** Check if the users are contacts already */
        if (!receiverIsContact) {

          /** Push each other id's and set the contact as pending*/
          sender.contacts.push({
            user: receiver.user,
            state: statics.model('state', 'pending')._id
          });

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

          /** The contact state is Active */
        } else if (_.isEqual(receiverIsContact.state, statics.model('state', 'active')._id)) {

          debug('Users %s and %s are already contacts', receiver.user, sender.user);
          res.sendStatus(400);

          /** The contact state is Pending */
        } else if (_.isEqual(receiverIsContact.state, statics.model('state', 'pending')._id)) {

          debug('Contact request between %s and %s is waiting for confirmation', receiver.user, sender.user);
          res.sendStatus(409);

          /** The users were contacts, but in some point one of them disabled the relation */
        } else {

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
   *  Confirm contact request.
   *
   * @type Express Middleware.
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
   * Delete a contact or reject a contact request.
   *
   * @type Express Middleware.
   */
  router.delete('/:id', function(req, res, next) {

    var user1IsContact;
    var user2IsContact;
    var user1 = null;
    var user2 = null;

    relations.contact(req.params.id, function(err, user2Relation) {

      if (err || !user2Relation.contact) {
        debug('No contacts list found for user with id %s', req.params.id);
        return res.sendStatus(404);
      }

      user2 = user2Relation.contact;

      relations.contact(req.session.user._id, function(err, senderRelation) {

        if (err || !senderRelation.contact) {
          debug('No contacts list found for user with id %s', req.session.user._id);
          return res.sendStatus(404);
        }

        user1 = senderRelation.contact;

        user1IsContact = user2Relation.isContact(user1.user);
        user2IsContact = senderRelation.isContact(user2.user);

        if (user2IsContact) {

          user1.contacts[user2IsContact.index].state = statics.model('state', 'disabled')._id;
          user2.contacts[user1IsContact.index].state = statics.model('state', 'disabled')._id;

          user1.save(function(err) {
            if (err) {
              return next(err);
            }

            user2.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('User %s and %s are no longer contacts!', user2.user, user1.user);
              res.end();

            });
          });

        } else {

          user1IsContact = user2Relation.isContact(user1.user, true);
          user2IsContact = senderRelation.isContact(user2.user, true);

          /** Check if the contact is present in a pending state */
          if (!user2IsContact || !_.isEqual(user2IsContact.state, statics.model('state', 'pending')._id)) {
            debug('User %s and %s are no contacts with each other!', user2.user, user1.user);
            return res.sendStatus(400);
          }

          user1.contacts[user2IsContact.index].state = statics.model('state', 'disabled')._id;
          user2.contacts[user1IsContact.index].state = statics.model('state', 'disabled')._id;

          user1.save(function(err) {
            if (err) {
              return next(err);
            }

            user2.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('The contact request between %s and %s has been deleted!', user2.user, user1.user);
              res.end();
            });
          });
        }

        /* Remove contact request interaction */
        Interaction.findOne().

        or([{
          $and: [{
            sender: user1.user
          }, {
            receiver: user2.user
          }]
        }, {
          $and: [{
            sender: user2.user
          }, {
            receiver: user1.user
          }]
        }]).

        where('action', statics.model('action', 'contact-request')._id).

        exec(function(err, inter) {
          if (err) {
            debug(err);
          }

          if (inter) {

            Token.remove({
              _id: inter.token
            }).
            exec(function(err) {
              if (err) {
                debug(err);
              }

              inter.remove(function(err) {
                if (err) {
                  debug(err);
                }
              });
            });
          }
        });
      });
    });

  });

};
