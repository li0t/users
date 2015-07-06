/* jshint node: true */
/* global component */
'use strict';

/*var  _ = require('underscore');*/
var debug = require('debug')('app:api:groups');

var relations = component('relations');
/*var statics = component('statics');*/


module.exports = function(router, mongoose) {

  var Group = mongoose.model('group');
  var Profile = mongoose.model('profile');

  /**
   * Create new group
   */
  router.post('/create', function(req, res, next) {

    var creator = req.session.user._id;
    var members = req.body.members;
    var group, name = req.body.name;
    var now = new Date();

    function saveGroup() {

      group.save(function(err) {

        if (err) {
          next(err);
        } else {

          debug('Saved group %s with %s new members', group._id, group.members.length);
          res.status(201).send(group._id);

        }
      });
    }

    if (name) {

      new Profile({
        name: name
      }).

      save(function(err, profile) {

        if (err) {

          if (err.name && (err.name === 'CastError') || (err.name === 'ValidationError')) {
            res.sendStatus(400);
          } else {
            next(err);
          }

        } else {

          group = new Group({
            profile: profile._id,
            admin: creator
          });

          group.members.push({
            user: creator,
            joined: [now]
          });

          if (members && members.length) { /** Check if are member ids to save */

            /** Prevent a mistype error */
            if (typeof members === 'string') {
              members = [members];
            }

            relations.contact(creator, function(relation) {

              members.forEach(function(member) {

                if (mongoose.Types.ObjectId.isValid(member)) {

                  if (relation.isContact(member)) {

                    debug('Pushing %s into group members', member);
                    group.members.push({
                      user: member,
                      joined: [now]
                    });

                  } else {
                    debug('User %s and %s are not contacts with each other', creator, member);
                  }
                } else {
                  debug('%s is not a valid ObjectId', member);
                }
              });

              saveGroup();

            });
          } else {

            saveGroup();

          }
        }
      });
    } else {
      res.status(400).send('The group must have a name');
    }

  });

  /**);
   * Change group admin
   */
  router.put('/:groupId/changeAdmin/:id', function(req, res, next) {

    var group = req.params.groupId;
    var sessionUser = req.session.user._id;
    var user = req.params.id;

    relations.membership(group, function(membership) {

      group = membership.group;

      if (group) {

        if (membership.isAdmin(sessionUser)) { /** Check if logged user is the group admin */

          if (membership.isMember(user)) {

            group.admin = user;

            group.save(function(err) {

              if (err) {
                next(err);
              } else {

                debug('The group %s, has a new admin with id %s', group._id, user);
                res.send('The group ' + group._id + ' has a new admin with id ' + user);

              }
            });
          } else {
            debug('No user with id %s found in group %s', req.params.id, req.params.groupId);
            res.sendStatus(400);
          }
        } else {
          res.sendStatus(403);
        }
      } else {
        debug('No group found with id %s', req.params.groupId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get user groups
   */
  router.get('/me', function(req, res, next) {

    var user = req.session.user._id;
    var groups = [];
    var toCheck = 0;
    var checked = 0;

    Group.

    find().

    where('members.user', user).

    sort('created').

    select('id admin profile members created').

    deepPopulate('profile admin.profile').

    exec(function(err, found) {

      if (err) {
        next(err);

      } else if (found.length) {

        toCheck = found.length;

        found.forEach(function(group) {

          relations.membership(group._id, function(relation) {

            if (relation.isMember(user)) {
              groups.push(group);
            }

            checked += 1;

            if (checked === toCheck) {
              res.send(groups);
            }

          });
        });

      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get a group
   */
  router.get('/:id/profile', function(req, res, next) {

    var group = req.params.id;
    var user = req.session.user._id;

    relations.membership(group, function(relation) {

      if (relation.group) {

        group = relation.group;

        if (relation.isMember(user)) {

          group.deepPopulate('profile admin.profile', function(err, group) {
            if (err) {
              return next(err);
            }

            res.send(group);

          });
        } else {
          res.sendStatus(403);
        }
      } else {
        res.sendStatus(404);
      }
    });

  });

};
