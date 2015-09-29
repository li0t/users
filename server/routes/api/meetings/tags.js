'use strict';

var debug = require('debug')('app:api:meetings:tags');

var relations = component('relations');

module.exports = function(router, mongoose) {

  var Meeting = mongoose.model('meeting');
  var Tag = mongoose.model('tag');

  /**
   * Get Meetings by their Tags.
   *
   * @type Express Middleware.
   */
  router.get('/like', function(req, res, next) {

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
   * Add Tags to a Meeting.
   *
   * @type Express Middleware.
   */
  router.post('/add-to/:id', function(req, res, next) {

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

};
