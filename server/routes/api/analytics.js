'use strict';

var debug = require('debug')('app:api:analytics');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Group = mongoose.model('group');
  var Task = mongoose.model('task');

  /**
   *
   */
  router.get('/groups', function(req, res, next) {

    var i, user = req.session.user._id;
    var toCheck = 0;
    var checked = 0;
    var groups = [];

    Group.find().

    where('members.user', user).

    sort('-_id').

    deepPopulate('profile members.user admin.profile').

    exec(function(err, found) {
      if (err) {
        return next(err);
      }

      if (found.length) {

        toCheck = found.length;

        found.forEach(function(group) {

          relations.membership(group._id, function(err, relation) {

            if (group.profile.name !== 'own' && relation.isMember(user)) {

              relation.group = group;
              relation.cleanMembers();

              groups.push(relation.group);
            }

            checked += 1;

            if (checked === toCheck) {

              checked = 0;
              toCheck = groups.length;

              groups.forEach(function(group) {

                group = group.toObject();

                Task.find().

                where('group', group._id).
                where('deleted', null).
                deepPopulate('collaborators.user creator.profile entries priority').

                exec(function(err, tasks) {
                  if (err) {
                    return next(err);
                  }

                  tasks.forEach(function(task) {

                    for (i = 0; i < task.collaborators.length; i++) {
                      /** Check if user is actual collaborator of task */
                      if (task.collaborators[i].left.length && (task.collaborators[i].left.length === task.collaborators[i].joined.length)) {
                        /** Remove it from the array and reallocate index */
                        task.collaborators.splice(i, 1);
                        i -= 1;
                      }
                    }
                  });

                  group.tasks = tasks;

                  checked += 1;

                  if (checked === toCheck) {
                    debug(groups[1].tasks);
                    res.send(groups);
                  }
                });
              });
            }
          });
        });

      } else {
        res.send(groups);
      }
    });


  });



};
