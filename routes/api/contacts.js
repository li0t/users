/* jshint node: true */
'use strict';

var debug = require('debug')('app:api:contacts'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };

module.exports = function (router, mongoose) {

  var Contact = mongoose.model('contact');

  /** 
   * Looks for statics states and saves the ids
   *
   * FALLS WHEN THERE ARE NO STATICS INSTALLED
   */
  (function getStates() {
    var Sts = mongoose.model('static.state'),
        state;

    function lookup(name) {

      Sts.findOne({ name: name }, function (err, found) {
        if (err) {
          debug('Error! : %s', err);
        } else if(found){
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

    Contact.findOne().
    where('user', req.params.id).
    exec(function (err, receiver) { /* The ContactSchema of the receiver */
      if (err) {
        next(err);
      } else {
        if (receiver) {

          Contact.findOne().
          where('user', req.session.user._id).
          exec(function (err, sender) { /* The ContactSchema of the sender */
            if (err) {
              next(err);
            } else {
              if (sender) {

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
                        res.status(204).end();
                      }
                    });
                  }
                });
              } else {
                debug('No contacs list found for user with id %s', req.session.user._id);
                res.status(404).end();
              }
            }
          });
        } else {
          debug('No contacs list found for user with id %s', req.params.id);
          res.status(404).end();
        }
      }
    });

  });

  /** 
   *  Confirm request
   */
  router.get('/confirm/:id', function (req, res, next) {

    Contact.findOne().
    where('user', req.params.id).
    exec(function (err, sender) {
      if (err) {
        next(err);
      } else if (sender) {

        Contact.findOne().
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
              if (JSON.stringify(receiver.contacts[i].user) === JSON.stringify(req.params.id)) {
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
                    res.status(204).end();
                  }
                });
              }
            });
          } else {
            res.status(404).end();
          }
        });
      } else {
        res.status(404).end();
      }
    });

  });
  
  /**
   * Delete a contact
   */
  router.get('/delete/:id', function (req, res, next) {
    /*TODO*/
  });
  
  /**
   * Get contacts of a user
   */ 
  router.get('/:id', function(req, res, next){
    
    Contact.findOne().
    
    where('user', req.params.id).
    deepPopulate('user contacts.user contacts.state').
    
    exec(function(err, contacts){
      if(err){
        next(err);
      } else if(contacts){
        res.send(contacts);
      } else {
        res.status(404).end();
      }
    });
  });

};