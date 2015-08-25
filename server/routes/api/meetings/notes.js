'use strict';

var debug = require('debug')('app:api:meetings:notes');

var relations = component('relations');

module.exports = function(router /*, mongoose*/ ) {

  /**
   * Add notes to a meeting
   */
  router.post('/add-to/:id', function(req, res, next) {

    var user = req.session.user._id;
    var meeting = req.params.id;
    var notes = req.body.notes;
    var now = new Date();
    var saved = 0;

    if (!notes || !notes.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof notes === 'string') {
      notes = [notes];
    }

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('meeting %s is completed, no changes allowed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        notes.forEach(function(note) {
          if (note && typeof note === "string") {

            saved += 1;
            debug('Note -> %s added to meeting %s', note, meeting._id);
            meeting.notes.push({
              note: note,
              added: now
            });

          }

        });

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s new notes added to meeting %s', saved, notes.length, meeting._id);
          res.end();

        });
      });
    });

  });

  /**
   * Remove notes from meeting
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var user = req.session.user._id;
    var meeting = req.params.id;
    var notes = req.body.notes;
    var removed = 0;
    var index;
    var i;

    if (!notes || !notes.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof notes === 'string') {
      notes = [notes];
    }

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('meeting %s is completed, no changes allowed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        notes.forEach(function(note) {

          if (note) {

            index = -1;

            for (i = 0; i < meeting.notes.length; i++) {

              if (meeting.notes[i].note === note) {
                index = i;
                break;
              }
            }

            if (index > -1) {

              removed += 1;
              debug('Note -> %s removed from meeting %s', note, meeting._id);
              meeting.notes.splice(index, 1);

            } else {
              debug('Note -> %s was not found in meeting %s', note, meeting._id);
            }

            meeting.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('%s of %s notes removed from meeting %s', removed, notes.length, meeting._id);
              res.end();

            });
          }
        });
      });
    });

  });

};
