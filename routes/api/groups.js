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
   * Get group members
   */
  router.get('/:groupId/members', function(req, res, next) {

    var members = [];

    Group.

    findOne().

    where('_id', req.params.groupId).

    where('members.user', req.session.user._id).

    deepPopulate('members.user').

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
