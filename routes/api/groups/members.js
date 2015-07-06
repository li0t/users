/* jshint node: true */
/* global component */
'use strict';

/*var  _ = require('underscore');*/
var debug = require('debug')('app:api:groups:members');

var relations = component('relations');
/*var statics = component('statics');*/


module.exports = function(router, mongoose) {

  var Group = mongoose.model('group');
  var Profile = mongoose.model('profile');

  /**
   * Get group members
   */
  router.get('/:groupId/members', function(req, res, next) {

    var members = [];

    Group.

    findOne().

    where('_id', req.params.groupId).

    where('members.user', req.session.user._id).

    deepPopulate('members.user members.user.profile').

    exec(function(err, group) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (group) {

        group.members.forEach(function(member) {

          if (!member.left.length) { /* Check if user left in some point */

            members.push(member);

          } else if (member.joined.length > member.left.length) {

            members.push(member);

          }

        });

        res.send(members);

      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Add member to a group
   */
  router.post('/:groupId/addMembers', function(req, res, next) {

    var adder = req.session.user._id;
    var group = req.params.groupId;
    var members = req.body.members;
    var now = new Date();
    var wasMember;
    var saved = 0;

    if (members && members.length) {

      /** Prevent a mistype error */
      if (typeof members === 'string') {
        members = [members];
      }

      relations.membership(group, function(membership) {

        group = membership.group;

        if (group) {

          if (membership.isMember(adder)) { /** Check if adder is member of the group */

            relations.contact(adder, function(relation) {

              members.forEach(function(member) {

                if (relation.isContact(member)) {

                  if (!membership.isMember(member)) {

                    wasMember = membership.wasMember(member);

                    if (wasMember) {

                      saved += 1;
                      debug('Rejoining %s into group %s members', member, group._id);
                      group.members[wasMember.index].joined.push(now);

                    } else {

                      saved += 1;
                      debug('Pushing %s into group %s members', member, group._id);
                      group.members.push({
                        user: member,
                        joined: [now]
                      });

                    }
                  } else {
                    debug('User %s already belongs to the group %s', member, group._id);
                  }
                } else {
                  debug('User %s and %s are not contacts with each other', adder, member);
                }
              });

              group.save(function(err) {
                if (err) {
                  next(err);

                } else {

                  debug('Saved group %s with %s new members', group._id, saved);
                  res.send('Added ' + saved + ' new members to group ' + group._id);

                }
              });
            });
          } else {
            debug('User %s was not found in group %s', adder, group._id);
            res.sendStatus(403);
          }
        } else {
          debug('No group found with id %s', req.params.groupId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Remove member from group
   */
  router.post('/:groupId/removeMembers', function(req, res, next) {

    var toRemove, removed = 0;
    var lostAdmin = false;
    var i;
    var remover = req.session.user._id;
    var group = req.params.groupId;
    var now = new Date();
    var members = req.body.members;

    if (members && members.length) {

      /** Prevent a mistype error */
      if (typeof members === 'string') {
        members = [members];
      }

      relations.membership(group, function(membership) {

        group = membership.group; /** The group model */

        if (group) {

          remover = membership.isMember(remover);

          if (remover) { /** Check if remover is part of group */

            members.forEach(function(member) {

              toRemove = membership.isMember(member);

              if (toRemove) { /** Check if user to remove is member of group */

                /** Check if remover has enough privileges */
                if (membership.isAdmin(remover.member) || JSON.stringify(member) === JSON.stringify(remover.member)) {

                  removed += 1;
                  debug('User %s removed from group %s', member, group._id);
                  member = group.members[toRemove.index];
                  member.left.push(now); /** Set member left time */

                  if (membership.isAdmin(member.user)) {
                    lostAdmin = member.user;
                  }

                } else {
                  debug('User %s does not have enough privileges in group %s', remover.member, group._id);
                }
              } else {
                debug('No user with id %s found in group %s', member, req.params.groupId);
              }
            });

            if (lostAdmin) {

              while (lostAdmin) {

                for (i = 0; i < group.members.length; i++) {

                  if (JSON.stringify(group.members[i].user) !== lostAdmin) {

                    group.admin = group.members[i].user;
                    debug('The group %s, has a new admin with id %s', group._id, group.admin);
                    lostAdmin = false;
                    break;

                  }
                }
              }
            }

            group.save(function(err) {
              if (err) {
                next(err);

              } else {

                debug('%s of %s members removed from group %s', removed, members.length, group._id);
                res.send(removed + ' of ' + members.length + ' members removed from group ' + group._id);

              }
            });

          } else {
            debug('User %s was not found in group %s', req.session.user._id, group._id);
            res.sendStatus(403);
          }
        } else {
          debug('No group found with id %s', req.params.groupId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

};
