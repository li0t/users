/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt'),
    _ = require('underscore'),
    debug = require('debug')('app:api:profiles'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };

module.exports = function (router, mongoose) {

  var User = mongoose.model('user'),
      Profile = mongoose.model('profile'),
      Contact = mongoose.model('contact');

  /** 
   * Looks for statics states and saves the ids
   * FALLS WHEN THERE ARE NO STATICS INSTALLED
   */
  (function getStates() {
    var
    Sts = mongoose.model('static.state'),
        state;

    function lookup(name) {
      Sts.findOne({
        name: name
      }, function (err, found) {
        if (err) {
          debug('Error! : %s', err);
        } else {
          States[name] = found._id;
        }
      });
    }

    for (state in States) {
      if (States.hasOwnProperty(state)) {
        lookup(state);
      }
    }

  })();

  router.post('/email', function(req, res, next){

    User.findOne().

    where('email', req.body.email).

    exec(function(err, user){
      
      if(err){
        if (err.name && err.name === 'ValidationError') {
          res.sendStatus(400);
        } else {
          next(err);
        }
        
      } else if (user) {
        res.send(user._id);
        
      } else {
        res.redirect('/api/users/createAndInvite/' + req.body.email); 
      }
    });
    
  });

};