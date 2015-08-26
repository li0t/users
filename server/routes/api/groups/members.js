'use strict';

/*var  _ = require('underscore');*/
var debug = require('debug')('app:api:groups:members');

var relations = component('relations');
/*var statics = component('statics');*/


module.exports = function(router /*, mongoose */ ) {

  /**
   * Get group members
   */
  router.get('/of/:id', function(req, res, next) {

    relations.membership(req.params.id, function(err, relation) {
      if (err) {
        return next(err);
      }

      if (!relation.group) {
        debug('Group %s was not found', req.params.id);
        return res.sendStatus(404);
      }

      if (!relation.isMember(req.session.user._id)) {
        debug('User %s is not member of group %s', req.session.user._id, req.params.id);
        return res.sendStatus(403);
      }

      relation.cleanMembers();

      relation.group.deepPopulate('members.user members.user.profile', function(err, group) {
        if (err) {
          return next(err);
        }

        res.send(group.members);

      });
    });

  });

  /**
   * Add member to a group
   */
  router.post('/add-to/:id', function(req, res, next) {

    var adder = req.session.user._id;
    var members = req.body.members;
    var group = req.params.id;
    var now = new Date();
    var wasMember;
    var saved = 0;

    if (!members || !members.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof members === 'string') {
      members = [members];
    }

    relations.membership(group, function(err, membership) {

      if (err || !membership.group) {
        debug('No group found with id %s', req.params.id);
        return res.sendStatus(404);
      }

      group = membership.group;

      if (!membership.isMember(adder)) { /** Check if adder is member of the group */
        debug('User %s was not found in group %s', adder, group._id);
        return res.sendStatus(403);
      }

      relations.contact(adder, function(err, relation) {

        members.forEach(function(member) {

          if (!err && relation.contact && relation.isContact(member)) {

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
            return next(err);

          }

          debug('Saved group %s with %s new members', group._id, saved);
          res.end();

        });
      });
    });

  });

  /**
   * Remove members from group
   */
  router.post('/remove-from/:id', function(req, res, next) {

    var remover = req.session.user._id;
    var members = req.body.members;
    var toRemove, removed = 0;
    var group = req.params.id;
    var lostAdmin = false;
    var now = new Date();
    var i;

    if (!members || !members.length) {
      return res.sendStatus(400);
    }

    /** Prevent a mistype error */
    if (typeof members === 'string') {
      members = [members];
    }

    relations.membership(group, function(err, membership) {

      if (err || !membership.group) {
        debug('No group found with id %s', req.params.id);
        return res.sendStatus(404);
      }

      group = membership.group; /** The group model */

      remover = membership.isMember(remover);

      if (!remover) { /** Check if remover is part of group */
        debug('User %s was not found in group %s', req.session.user._id, group._id);
        return res.sendStatus(403);
      }

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
          debug('No user with id %s found in group %s', member, req.params.id);
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
          return next(err);
        }

        debug('%s of %s members removed from group %s', removed, members.length, group._id);
        res.end();

      });
    });
  });

};
