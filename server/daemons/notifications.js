'use strict';

var debug = require('debug')('app:daemons:notifications');
var scheduler = require('node-schedule');
var request = require('request');
var moment = require('moment');
var path = require('path');

/* Obtain the app's root path */
var root = path.resolve(__dirname, '..');

require(root + '/globals')(global);

var statics = component('statics');
var host = 'http://192.168.0.112:3030';
var url = '/api/interactions/task-expired-one-week';

/**
 * The time to send all the briefs (UTC time).
 */
var taskSchedule = {
  hour: 10,
  minute: 56
};


/**
 * Initializes the daemon.
 */
function startDaemon() {

  debug("Starting the notifications daemon...");


  function sendExpiredTasks() {
    debug('Checking expired tasks...');

    var mongoose = require('mongoose');

    var Interaction = mongoose.model('interaction');
    var Task = mongoose.model('task');
    var now = moment();

    Task.find().

    exists('completed', false).
    exists('deleted', false).
    exists('dateTime').

    where('dateTime').lt(now).

    exec(function(err, tasks) {
      if (err) {
        debug(err);
      }

      tasks.forEach(function(task) {

        if (now.diff(task.dateTime, 'days') > 6) {

          Interaction.count().

          where('modelRelated', task._id).
          where('action', statics.model('action', 'task-expired-one-week')._id).

          exec(function(err, count) {
            if (err) {
              return debug(err);
            }

            if (!count) {

              request.post({
                  url: host + url,
                  json: {
                    task: task._id
                  }
                },
                function(err, httpResponse, body) {
                  debug('ERROR: %s', err);
                  debug('HTTP-RESPONSE: %s', JSON.stringify(httpResponse));
                  debug('BODY: %s', body);
                });
            }
          });
        }
      });
    });

  }

  /**
   * Schedule the task to send all the available briefs.
   */
  scheduler.scheduleJob(taskSchedule, sendExpiredTasks);

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
