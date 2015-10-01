'use strict';

var debug = require('debug')('app:api:meetings:items');

var relations = component('relations');

module.exports = function(router) {

  /**
   * Add items to a Meeting.
   *
   * @type Express Middleware.
   */
  router.post('/add-to/:id', function(req, res, next) {

    var user = req.session.user._id;
    var meeting = req.params.id;
    var items = req.body.items;
    var saved = 0;

    if (!items || !items.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof items === 'string') {
      items = [items];
    }

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('Meeting %s is completed, no changes allowed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        items.forEach(function(item) {

          if (item && typeof item === "string") {

            saved += 1;
            debug('Item -> %s added to meeting %s', item, meeting._id);
            meeting.items.push({
              description: item
            });
          }
        });

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('%s of %s new items added to meeting %s', saved, items.length, meeting._id);
          res.end();

        });
      });
    });

  });

  /**
   * Remove items from a Meeting.
   *
   * @type Express Middleware.
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var user = req.session.user._id;
    var meeting = req.params.id;
    var items = req.body.items;
    var removed = 0;
    var index;
    var i;

    if (!items || !items.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof items === 'string') {
      items = [items];
    }

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('Meeting %s is completed, no changes allowed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        items.forEach(function(item) {

          if (item) {

            index = -1;

            for (i = 0; i < meeting.items.length; i++) {

              if (meeting.items[i].description === item) {
                index = i;
                break;
              }
            }

            if (index > -1) {

              removed += 1;
              debug('Item -> %s removed from meeting %s', item, meeting._id);
              meeting.items.splice(index, 1);

            } else {
              debug('Item -> %s was not found in meeting %s', item, meeting._id);
            }

            meeting.save(function(err) {
              if (err) {
                return next(err);
              }

              debug('%s of %s items removed from meeting %s', removed, items.length, meeting._id);
              res.end();

            });
          }
        });
      });
    });

  });

  /**
   * Set items of a Meeting as checked.
   *
   * @type Express Middleware.
   */
  router.put('/of/:id/check', function(req, res, next) {

    var user = req.session.user._id;
    var i, meeting = req.params.id;
    var items = req.body.items;
    var now = new Date();

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('Meeting %s is already closed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        items.forEach(function(item) {

          for (i = 0; i < meeting.items.length; i++) {
            if (meeting.items[i].description === item) {
              meeting.items[i].checked = now;
              break;

            }
          }
        });

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Meeting %s items checked', meeting._id);
          res.end();

        });
      });
    });

  });

  /**
   * Set items of a Meeting as not-checked.
   *
   * @type Express Middleware.
   */
  router.put('/of/:id/uncheck', function(req, res, next) {

    var user = req.session.user._id;
    var i, meeting = req.params.id;
    var items = req.body.items;

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      if (meeting.completed) {
        debug('Meeting %s is already closed', meeting._id);
        return res.sendStatus(403);
      }

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        items.forEach(function(item) {

          for (i = 0; i < meeting.items.length; i++) {
            if (meeting.items[i].description === item) {
              meeting.items[i].checked = null;
              break;

            }
          }
        });

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Meeting %s items unchecked', meeting._id);
          res.end();

        });
      });
    });

  });

};
