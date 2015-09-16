'use strict';

var debug = require('debug')('app:api:analytics');

// var relations = component('relations');

module.exports = function(router, mongoose) {

  var Group = mongoose.model('group');
  var Task = mongoose.model('task');

  var leaf = 10;

  /** Task and Group formater **/
  function format(doc, attribute) {

    var priority, creator, admin, i;
    var activities = [];
    var children = [];
    var tags = [];

    for (i = 0; i < doc[attribute].length; i++) {

      if (doc[attribute][i].left.length && doc[attribute][i].left.length === doc[attribute][i].joined.length) {
        doc[attribute].splice(i, 1);
        i -= 1;

      } else {
        doc[attribute][i].name = doc[attribute][i].user.profile.name && doc[attribute][i].user.profile.name || doc[attribute][i].user.email;
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

  /**
   *
   */
  router.get('/circles', function(req, res, next) {

    var user = req.session.user._id;
    var toCheck = 0;
    var checked = 0;

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

};
