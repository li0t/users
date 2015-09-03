'use strict';

//var scheduler = require('node-schedule');
//var moment = require('moment');
var debug = require('debug')('app:daemons:notifications');
var socket = require('socket.io-client');
var path = require('path');

/* Obtain the app's root path */
var root = path.resolve(__dirname, '..');

require(root + '/globals')(global);

var statics = component('statics');

/**
 * The time to send all the briefs (UTC time).
 */
// var schedule = {
//   hour: 0,
//   minute: 1
// };

//var spans = [30, 60, 90];

var delay = 60000;
var or;

/**
 * Initializes the daemon.
 */
function startDaemon() {

  debug("Starting the notifications daemon...");

  or = [{
    action: statics.model('action', 'contact-request')._id
  }, {
    action: statics.model('action', 'task-assigned')._id
  }, {
    action: statics.model('action', 'group-invite')._id
  }];

  function sendNotifications() {

    var mongoose = require('mongoose');

    var Notification = mongoose.model('notification');
    var Interaction = mongoose.model('interaction');

    Interaction.find().

    or(or).

    exec(function(err, inters) {
      if (err) {
        debug(err);
      }

      inters.forEach(function(inter) {

        Notification.findOne().

        where('interaction', inter._id).

        exec(function(err, not) {
          if (err) {
            debug(err);
          }

          if (!not) {

            debug('Creating new %s notification for user %s', inter.action, inter.receiver);

            new Notification({
              interaction: inter._id
            }).
            save(function(err) {
              if (err) {
                debug(err);
              }
            });
          }
        });
      });
    });

  }

  /**
   * Schedule the task to send all the available briefs.
   */
  setInterval(sendNotifications, delay);

  debug("Task is scheduled");
}

/**
 * Register statics.
 */
function registerStatics() {
  debug("Registering statics...");

  statics.load(config('statics'), function() {
    startDaemon();
  });
}

/**
 * Register schemas.
 */
function registerSchemas() {
  debug("Registering schemas...");

  component('schemas')(config('schemas').basedir);

  registerStatics();
}


// /**** Initialize Mandrill ****/
// debug("Initializing madrill...");
//
// var mandrill = component('mandrill');


/**** Initialize database ****/
debug("Initializing the database...");

config('mongoose')(registerSchemas);
