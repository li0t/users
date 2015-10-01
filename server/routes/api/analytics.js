'use strict';

var debug = require('debug')('app:api:analytics');
var moment = require('moment');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Group = mongoose.model('group');
  var Task = mongoose.model('task');

  /**
   * Get session user data to display it as a D3 Pack Layout.
   * @see <a href="https://github.com/mbostock/d3/wiki/Pack-Layout">Pack Layout</a>
   *
   * @type Express Middleware.
   */
  router.get('/circles', function(req, res, next) {

    var user = req.session.user._id;
    var toCheck = 0;
    var checked = 0;

    /**
     * Format Tasks and Groups as parent - children data structures
     * deleting the parent - level attributes.
     *
     * @param {Object} doc A Group or Task.
     * @param {String} attribute The attribute of the object to set as a children array.
     */
    function format(doc, attribute) {

      var priority, creator, admin, i;
      var activities = [];
      var children = [];
      var tags = [];
      var leaf = 10;

      for (i = 0; i < doc[attribute].length; i++) {

        if (doc[attribute][i].left.length && doc[attribute][i].left.length === doc[attribute][i].joined.length) {
          doc[attribute].splice(i, 1);
          i -= 1;

        } else {
          doc[attribute][i].name = doc[attribute][i].user.profile.name && doc[attribute][i].user.profile.name || doc[attribute][i].user.email;
          doc[attribute][i].value = leaf;

          delete doc[attribute][i].workedTimes;
          delete doc[attribute][i].joined;
          delete doc[attribute][i].left;
          delete doc[attribute][i].user;
        }
      }

      switch (attribute) {

        case 'members':

          doc.name = doc.profile.name;

          admin = {
            name: doc.admin ? (doc.admin.profile.name && doc.admin.profile.name || doc.admin.email) : 'Tu',
            value: leaf
          };

          children.push({
            name: "admin",
            children: [admin]
          });

          delete doc.admin;
          delete doc.profile;
          break;

        case 'collaborators':

          doc.name = doc.objective;

          priority = {
            name: doc.priority.slug,
            value: leaf
          };

          creator = {
            name: doc.creator.profile.name && doc.creator.profile.name || doc.creator.email,
            value: leaf
          };

          doc.activities.forEach(function(act) {
            activities.push({
              name: act.description,
              value: leaf
            });
          });

          doc.tags.forEach(function(tag) {
            tags.push({
              name: tag,
              value: leaf
            });
          });

          children.push({
            name: "activities",
            children: activities
          });

          children.push({
            name: "priority",
            children: [priority]
          });

          children.push({
            name: "creator",
            children: [creator]
          });

          children.push({
            name: "tags",
            children: tags
          });

          delete doc.activities;
          delete doc.objective;
          delete doc.priority;
          delete doc.dateTime;
          delete doc.entries;
          delete doc.creator;
          delete doc.group;
          delete doc.tags;
          break;
      }

      children.push({
        name: attribute,
        children: doc[attribute]
      });

      doc.children = children;
      delete doc[attribute];
    }

    Group.find().

    lean().

    where('members.user', user).

    sort('-_id').

    deepPopulate('profile members.user.profile admin.profile').

    exec(function(err, groups) {
      if (err) {
        return next(err);
      }

      if (!groups.length) {
        return res.send(groups);
      }

      toCheck = groups.length;

      groups.forEach(function(group) {

        format(group, 'members');

        Task.find().

        lean().

        where('group', group._id).
        where('deleted', null).
        deepPopulate('collaborators.user.profile creator.profile entries priority').

        exec(function(err, tasks) {
          if (err) {
            return next(err);
          }

          tasks.forEach(function(task) {
            format(task, 'collaborators');
          });

          group.children.push({
            name: "tasks",
            children: tasks
          });

          checked += 1;

          if (checked === toCheck) {

            res.send({
              name: "groups",
              children: groups
            });
          }
        });
      });

    });

  });

  /**
   * Get a single Task data to display it as a D3 Stack Layout.
   * @see <a href="https://github.com/mbostock/d3/wiki/Stack-Layout">Stack Layout</a>
   *
   * @type Express Middleware.
   */
  router.get('/worked-times/of/:id', function(req, res, next) {

    var user = req.session.user._id;
    var task = req.params.id;
    var i, allDays = [];
    var data = [];

    /**
     * Normalize task data.
     *
     * @return {Object} A Task object where each collaborator has the same
     * amount of days worked and the minimun time worked is 0 milliseconds.
     **/
    function normalizeData() {

      var present;

      data.forEach(function(collaborator) {
        allDays.forEach(function(day) {

          present = collaborator.values.filter(function(span) {
            return day === span.x;
          });

          if (!present.length) {
            collaborator.values.push({
              x: day,
              y: 0
            });

          }
        });
      });
    }

    /**
     * Add up a Task worked-times.
     *
     * @return {Object} An array of milliseconds worked per day of the year.
     **/
    function workedTimes(times) {

      var span;
      var current = times.length && moment(times[0]);

      var days = current && [{
        x: current.dayOfYear(),
        y: current.millisecond()
      }];

      for (i = 1; i < times.length; i++) {
        span = moment(times[i]);

        if (allDays.indexOf(current.dayOfYear()) < 0) {
          allDays.push(current.dayOfYear());
        }

        if (current.diff(span, 'days')) {
          current = span;
          days.push({
            x: current.dayOfYear(),
            y: current.millisecond()
          });

        } else {
          days[days.length - 1].y += span.millisecond();

        }
      }

      return days;

    }

    relations.collaboration(task, function(err, collaboration) {

      /** Check if task exists and is available for changes */
      if (err || !collaboration.task) {
        debug('Task %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      task = collaboration.task; /** The task model */

      relations.membership(task.group, function(err, taskGroup) {

        if (err || !taskGroup.group || !taskGroup.isMember(user)) { /** Check if user is part of the task group */
          debug('User %s is not part of the task %s group', user, task._id);
          return res.sendStatus(403);
        }

        task.deepPopulate('collaborators.user', function(err, task) {
          if (err) {
            return next(err);
          }

          task.collaborators.forEach(function(collaborator) {

            /** Check if user is actual collaborator of task */
            if (!collaborator.left.length || (collaborator.left.length < collaborator.joined.length)) {
              data.push({
                "name": collaborator.user.email,
                values: workedTimes(collaborator.workedTimes)
              });
            }
          });

          normalizeData();

          res.send(data);

        });
      });
    });

  });

};
