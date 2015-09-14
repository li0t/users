'use strict';

var debug = require('debug')('app:api:meetings');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Meeting = mongoose.model('meeting');
  var Tag = mongoose.model('tag');


  /**
   * Get session user meetings
   */
  router.get('/', function(req, res, next) {

    var filter = req.query.filter && req.query.filter === 'attendant';
    var i, query;

    query = Meeting.find().

    where('creator', req.session.user._id).
    where('deleted', null);

    query = filter && query.where('attendants.user').ne(req.session.user._id) || query;

    query.deepPopulate('group.profile creator.profile  entries').

    sort('-_id').

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

  /**
   * Get meetings by keywords
   */
  router.get('/like', function(req, res, next) {

    var keywords = req.query.keywords;
    var limit = req.query.limit;
    var skip = req.query.skip;

    var score = {
      score: {
        $meta: "textScore"
      }
    };
    var find = {
      $text: {
        $search: keywords
      }
    };

    Meeting.find(find, score).

    sort('_id').
    sort(score).

    skip(skip).
    limit(limit).

    populate('group').

    exec(function(err, meetings) {
      if (err) {
        return next(err);
      }

      res.send(meetings);

    });
  });

  /**
   * Get meetings by tags stored
   */
  router.get('/tags', function(req, res, next) {

    var limit = req.query.limit;
    var skip = req.query.skip;
    var tags = req.query.tags;

    tags = (typeof tags === 'string') ? [tags] : tags;

    Meeting.find().

    where('tags').in(tags).

    skip(skip).
    limit(limit).

    sort('-_id').
    deepPopulate('group.profile').

    exec(function(err, meetings) {
      if (err) {
        return next(err);
      }

      res.send(meetings);

    });
  });

  /**
   * Create a new meeting
   */
  router.post('/', function(req, res, next) {

    var dateTime = req.body.dateTime || null;
    var creator = req.session.user._id;
    var group = req.body.group;

    relations.membership(group, function(err, membership) {

      if (err || !membership.group) {
        debug('Group %s not found', req.body.group);
        return res.sendStatus(400);
      }

      group = membership.group; /** The group model */

      if (!membership.isMember(creator)) {
        debug('User is not part of group %s', creator, group._id);
        return res.sendStatus(403);
      }

      new Meeting({
        objective: req.body.objective,
        items: req.body.items,
        notes: req.body.notes,
        dateTime: dateTime,
        group: group._id,
        creator: creator
      }).

      save(function(err, meeting) {
        if (err) {
          return next(err);
        }

        debug('Meeting %s created', meeting._id);
        res.status(201).send(meeting._id);

      });
    });

  });

  /**
   * Add Tags to a Meeting
   */
  router.post('/:id/tags', function(req, res, next) {

    var user = req.session.user._id;
    var tags = req.body.tags;
    var tagsSaved = 0;
    var meeting;

    /* Check if all tags were found and/or created */
    function onTagReady(tag) {

      meeting.tags.push(tag.name);

      tagsSaved += 1;

      if (tagsSaved === req.body.tags.length) {
        meeting.save(function(err) {
          if (err) {
            return next(err);
          }
          res.sendStatus(204);

        });
      }
    }

    if (!tags || !tags.length) {
      return res.sendStatus(400);
    }

    /* Convert the tags string to array if necessary */
    if (typeof req.body.tags === 'string') {
      req.body.tags = [req.body.tags];
    }

    Meeting.findById(req.params.id).

    exec(function(err, data) {
      if (err) {
        return next(err);
      }

      if (!data) {
        return res.sendStatus(404);
      }

      meeting = data;

      tags = tags.filter(function(tag) {
        return meeting.tags.indexOf(tag) < 0;
      });

      relations.membership(meeting.group, function(err, membership) {

        if (err || !membership.group) {
          debug('Group %s not found', req.body.group);
          return res.sendStatus(400);
        }

        if (!membership.isMember(user)) {
          debug('User is not part of group %s', user, membership.group._id);
          return res.sendStatus(403);
        }

        tags.forEach(function(tag) {

          Tag.findOne().
          where('name', tag).

          exec(function(err, found) {
            if (err) {
              debug('Error! : %s', err);
            } else if (found) {
              debug('Tag found : %s', found.name);
              onTagReady(found);
            } else {
              debug('Creating new Tag : %s', tag);
              new Tag({
                name: tag
              }).
              save(function(err, newTag) {
                if (err) {
                  debug('Error! : %s', err);
                } else {
                  onTagReady(newTag);
                }
              });
            }
          });
        });
      });
    });

  });

  /**
   * Set meeting as deleted
   */
  router.delete('/:id', function(req, res, next) {

    var meeting = req.params.id;
    var user = req.session.user._id;

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

        meeting.deleted = new Date();

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Meeting %s is now set as disabled', meeting._id);
          res.end();

        });

      });
    });

  });

  /**
   * Edit meeting objective
   */
  router.put('/:id/objective', function(req, res, next) {

    var meeting = req.params.id;
    var user = req.session.user._id;

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

        meeting.objective = req.body.objective || meeting.objective;

        meeting.save(function(err) {
          if (err) {
            return next(err);
          }

          debug('Meeting %s objective changed to %s', meeting._id, meeting.objective);
          res.end();

        });
      });
    });

  });

  /**
   * Set meeting datetime
   */
  router.put('/:id/date-time', function(req, res, next) {

    var meeting = req.params.id;
    var user = req.session.user._id;

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

        meeting.dateTime = req.body.dateTime;

        meeting.save(function(err) {
          if (err) {
            if (err.name && (err.name === 'CastError' || err.name === 'ValidationError')) {
              res.sendStatus(400);
            } else {
              next(err);
            }
            return;
          }

          debug('Meeting %s dateTime was set to %s', meeting._id, meeting.dateTime);
          res.end();

        });
      });
    });

  });

  /**
   * Get a meeting
   **/
  router.get('/:id', function(req, res, next) {

    var i;
    var meeting = req.params.id;
    var user = req.session.user._id;

    relations.attendance(meeting, function(err, attendance) {

      /** Check if meeting exists and is available for changes */
      if (err || !attendance.meeting) {
        debug('Meeting %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      meeting = attendance.meeting; /** The meeting model */

      relations.membership(meeting.group, function(err, meetingGroup) {

        if (err || !meetingGroup.group || !meetingGroup.isMember(user)) { /** Check if user is part of the meeting group */
          debug('User %s is not allowed to modify meeting %s', user, meeting._id);
          return res.sendStatus(403);
        }

        for (i = 0; i < meeting.attendants.length; i++) {
          /** Check if user is actual attendant of meeting */
          if (meeting.attendants[i].left.length && (meeting.attendants[i].left.length === meeting.attendants[i].joined.length)) {
            /** Remove it from the array and reallocate index */
            meeting.attendants.splice(i, 1);
            i -= 1;
          }
        }

        meeting.deepPopulate('group.profile attendants.user entries.entry', function(err, meeting) {
          if (err) {
            return next(err);
          }

          res.send(meeting);

        });
      });
    });

  });

};
