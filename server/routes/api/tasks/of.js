'use strict';

var debug = require('debug')('app:api:tasks:of');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Task = mongoose.model('task');

  /**
   * Get tasks of a group
   */
  router.get('/group/:id', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;
    var i;

    relations.membership(group, function(err, relation) {

      if (err || !relation.group) {
        debug('Group  %s was not found', group);
        return res.sendStatus(404);
      }

      if (!relation.isMember(user)) {
        debug('User %s is not part of group %s', req.session.user._id, group);
        return res.sendStatus(403);
      }

      Task.find().

      where('group', group).
      where('deleted', null).

      sort('-_id').

      deepPopulate('priority').

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

        res.send(tasks);

      });
    });

  });

};
