'use strict';

var debug = require('debug')('app:api:meetings:of');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Meeting = mongoose.model('meeting');

  /**
   * Get Meetings of a Group.
   *
   * @type Express Middleware.
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

      Meeting.find().

      where('group', group).
      where('deleted', null).

      sort('-_id').

      deepPopulate('group.profile creator.profile entries attendants.user').

      exec(function(err, meetings) {

        if (err) {
          return next(err);
        }

        meetings.forEach(function(meeting) {

          for (i = 0; i < meeting.attendants.length; i++) {
            /** Check if user is actual attendant of meeting */
            if (meeting.attendants[i].left.length && (meeting.attendants[i].left.length === meeting.attendants[i].joined.length)) {
              /** Remove it from the array and reallocate index */
              meeting.attendants.splice(i, 1);
              i -= 1;
            }
          }
        });

        res.send(meetings);

      });
    });

  });

};
