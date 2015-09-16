'use strict';

// var debug = require('debug')('app:api:analytics');

// var relations = component('relations');

module.exports = function(router, mongoose) {

  var Group = mongoose.model('group');
  var Task = mongoose.model('task');


  /** Task and Group cleaner **/
  function clean(doc, attribute) {

    var i;

    for (i = 0; i < doc[attribute].length; i++) {

      if (doc[attribute][i].left.length && doc[attribute][i].left.length === doc[attribute][i].joined.length) {

        doc[attribute].splice(i, 1);
        i -= 1;

      }
    }
  }

  /**
   *
   */
  router.get('/groups', function(req, res, next) {

    var user = req.session.user._id;
    var toCheck = 0;
    var checked = 0;

    Group.find().

    lean().

    where('members.user', user).

    sort('-_id').

    deepPopulate('profile members.user admin.profile').

    exec(function(err, groups) {
      if (err) {
        return next(err);
      }

      if (!groups.length) {
        return res.send(groups);
      }

      toCheck = groups.length;

      groups.forEach(function(group) {

        clean(group, 'members');

        Task.find().

        lean().

        where('group', group._id).
        where('deleted', null).
        deepPopulate('collaborators.user creator.profile entries priority').

        exec(function(err, tasks) {
          if (err) {
            return next(err);
          }

          tasks.forEach(function(task) {
            clean(task, 'collaborators');
          });

          group.tasks = tasks;

          checked += 1;

          if (checked === toCheck) {

            res.send(groups);
          }
        });
      });

    });


  });



};
