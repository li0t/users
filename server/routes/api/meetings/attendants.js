'use strict';

var debug = require('debug')('app:api:meetings:attendants');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Meeting = mongoose.model('meeting');

  /**
   * Get meetings where session user is attendant
   */
  router.get('/me', function(req, res, next) {

    var user = req.session.user._id;
    var i, j;

    Meeting.find().

    where('attendants.user', user).
    where('deleted', null).

    deepPopulate('group.profile creator.profile attendants.user entries').

    sort('-created').

    exec(function(err, meetings) {
      if (err) {
        return next(err);
      }

      for (i = 0; i < meetings.length; i++) {

        for (j = 0; j < meetings[i].attendants.length; j++) {

          if (JSON.stringify(meetings[i].attendants[j].user._id) === JSON.stringify(user)) {

            if (meetings[i].attendants[j].left.length && (meetings[i].attendants[j].left.length === meetings[i].attendants[j].joined.length)) {
              /** Remove it from the array and reallocate index */
              meetings.splice(i, 1);
              i -= 1;

              /* Check if user is currently working on meeting */
            } else {

              meetings[i] = meetings[i].toObject();
              meetings[i].isAttendant = true;

            }
            break;
          }
        }
      }

      res.send(meetings);

    });

  });

  /**
   * Get meetings where session user is currently working
   */
  router.get('/me/working', function(req, res, next) {

    var user = req.session.user._id;
    var meetings = [];
    var i, j;

    Meeting.find().

    where('attendants.user', user).
    where('completed', null).
    where('deleted', null).

    exec(function(err, found) {
      if (err) {
        return next(err);
      }

      for (i = 0; i < found.length; i++) {

        for (j = 0; j < found[i].attendants.length; j++) {

          if (JSON.stringify(found[i].attendants[j].user) === JSON.stringify(user)) {

            if (!found[i].attendants[j].left.length || (found[i].attendants[j].joined.length > found[i].attendants[j].left.length)) {

              if (found[i].attendants[j].workedTimes.length % 2 !== 0) {

                meetings.push(found[i]._id);

              }
            }
            break;
          }
        }
      }

      res.send(meetings);

    });

  });

  /**
   * Add attendants to a meeting
   */
  router.post('/add-to/:id', function(req, res, next) {

    var meeting = req.params.id;
    var inviter = req.session.user._id;
    var attendants = req.body.attendants;
    var saved = 0;
    var now = new Date();
    var wasAttendant;

    if (!attendants || !attendants.length) {
      return res.sendStatus(400);
    }
    /** Prevent a mistype error */
    if (typeof attendants === 'string') {
      attendants = [attendants];
    }

    relations.attendance(meeting, function(err, relation) {

      /** Check if meeting exists and is available for changes */
      if (err || !relation.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = relation.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('Meeting %s is completed, no changes allowed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(inviter)) {
          debug('User is not part of meeting group %s', inviter, meeting.group);
          return res.sendStatus(403);
        }

        attendants.forEach(function(attendant) {

          if (meetingGroup.isMember(attendant)) {

            if (!relation.isAttendant(attendant)) {

              wasAttendant = relation.wasAttendant(attendant);

              if (!wasAttendant) {

                debug('New attendant %s added to meeting %s', attendant, meeting._id);
                meeting.attendants.push({
                  user: attendant,
                  joined: [now]
                });
                saved += 1;

              } else {

                debug('Attendant %s re-joined meeting %s', attendant, meeting._id);
                meeting.attendants[wasAttendant.index].joined.push(now);
                saved += 1;

              }
            } else {
              debug('User %s is already attending to meeting %s', attendant, meeting._id);
            }
          } else {
            debug('Users %s and %s are not in the same group', inviter, attendant);
          }
        });

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s new attendants added to meeting %s', saved, attendants.length, meeting._id);
          res.end();

        });
      });
    });

  });

  /**
   * Remove attendants from meeting
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var removed = 0;
    var remover = req.session.user._id;
    var meeting = req.params.id;
    var attendants = req.body.attendants;
    var attendant;
    var now = new Date();

    if (!attendants || !attendants.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof attendants === 'string') {
      attendants = [attendants];
    }

    relations.attendance(meeting, function(err, relation) {

      /** Check if meeting exists and is available for changes */
      if (err || !relation.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      /** The meeting model */
      meeting = relation.meeting;

      if (meeting.completed) {
        debug('Meeting %s is completed, no changes allowed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        /** Check if remover is part of the meeting group */
        if (err || !meetingGroup.group || !meetingGroup.isMember(remover)) {
          debug('User %s is not part of meeting %s group', remover, meeting.group);
          return res.sendStatus(403);
        }

        attendants.forEach(function(_attendant) {

          attendant = relation.isAttendant(_attendant);

          /** Check if user is a meeting attendant */
          if (attendant) {

            removed += 1;
            debug('Attendant %s removed from meeting %s', _attendant, meeting._id);
            meeting.attendants[attendant.index].left.push(now); /** Add one left instance for meeting attendant */

          } else {
            debug('User %s is not attendant of meeting %s', _attendant, meeting._id);
          }
        });

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s attendants removed from meeting %s', removed, attendants.length, meeting._id);
          res.end();

        });
      });
    });

  });

};
