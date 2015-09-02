'use strict';

var debug = require('debug')('app:daemons:notifications');
//var scheduler = require('node-schedule');
//var moment = require('moment');
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

var delay = 30000;

/**
 * Initializes the daemon.
 */
function startDaemon() {
  debug("Starting the notifications daemon...");

  function sendNotifications() {
    var mongoose = require('mongoose');
    debug('NOTIFY!!!!');
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

  statics.load(config('statics'), function () {
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
