'use strict';

var debug = require('debug')('app:notifications');
var mongoose = require('mongoose');

var sockets;
//var statics = component('statics');

function notify(inter) {

  var Notification = mongoose.model('notification');

  sockets = require('fi-seed-component-sockets');

  Notification.count().

  where('interaction', inter._id).

  exec(function(err, count) {
    if (err) {
      return debug(err);
    }

    if (!count) {

      new Notification({
        interaction: inter._id
      }).
      save(function(err) {
        if (err) {
          return debug(err);
        }
        debug('yoh!');
        sockets.of('/notifications').to(inter.receiver).emit('notification');

      });
    }
  });


}


function clean(inter) {

  var Notification = mongoose.model('notification');

  Notification.remove({
    interaction: inter._id
  }, function(err) {
    if (err) {
      return debug(err);
    }

  });

}


module.exports = {

  notify: notify,
  clean: clean

};
