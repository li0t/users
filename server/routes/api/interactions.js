'use strict';

var debug = require('debug')('app:api:interactions');

var statics = component('statics');

module.exports = function(router, mongoose) {

  var Interaction = mongoose.model('interaction');
  var Token = mongoose.model('token');

  router.post('/email-confirmation', function(req, res, next) {

    new Token().
    save(function(err, token) {
      if (err)  {
        return next(err);
      }

     new Interaction({
       action:  statics.model('action', 'email-confirmation')._id,
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

};
