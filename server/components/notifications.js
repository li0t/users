module.exports = (function() {

  'use strict';

  var debug = require('debug')('app:notifications');
  var scheduler = require('node-schedule');
  var mongoose = require('mongoose');
  var moment = require('moment');

  var statics = component('statics');
  var sockets;

  var Notification;
  var Interaction;
  var Task;

  /** Configuration Data **/
  var config = {
    expiredTasksSchedule: {},
  };

  /**
   * Create a new Notification for an Interaction
   * and notify the client via socket.
   *
   * @param {Object} inter The Interaction document to be notified.
   */
  function notify(inter) {

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

          sockets.of('/notifications').to(inter.receiver).emit('notification');

        });
      }
    });

  }

  /**
   * Delete a Notification whose Interaction is gone.
   *
   * @param {Object} inter The Interaction document that is about to be deleted.
   */
  function clean(inter) {

    Notification.remove({
      interaction: inter._id
    }, function(err) {
      if (err) {
        return debug(err);
      }

    });

  }

  /**
   * Check for Tasks whose datetime expired a week ago and notify them.
   */
  function sendExpiredTasks() {

    debug('Checking expired tasks...');

    var now = moment();

    Task.find().

    exists('completed', false).
    exists('deleted', false).
    exists('dateTime').

    // Issue here!!!
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

              var checked = 0;

              task.collaborators.forEach(function(collaborator) {

                /**
                 * This action @fires Notifications#notify
                 */
                new Interaction({
                  action: statics.model('action', 'task-expired-one-week')._id,
                  receiver: collaborator.user,
                  modelRelated: task._id
                }).
                save(function(err) {
                  if (err) {
                    debug(err);
                  }

                  checked += 1;

                  if (checked === task.collaborators.length) {
                    debug('A week ago expired task interactions created!');
                  }
                });
              });
            }
          });
        }
      });
    });

  }

  /**
   * Initialize the component settings and schedules jobs.
   */
  function init() {

    Notification = mongoose.model('notification');
    Interaction = mongoose.model('interaction');
    Task = mongoose.model('task');

    sockets = require('fi-seed-component-sockets');

    config.expiredTasksSchedule = {
      hour: 13,
      minute: 30
    };

    scheduler.scheduleJob(config.expiredTasksSchedule, sendExpiredTasks);
    //setInterval(sendExpiredTasks, 5000);

    debug("Notifications Scheduled");

  }

  return {
    init: init,
    clean: clean,
    notify: notify
  };

}());
