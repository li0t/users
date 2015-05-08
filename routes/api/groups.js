/* jshint node: true */
/* global component */
'use strict';

var //_ = require('underscore'),
debug = require('debug')('app:api:groups');

var relations = component('relations')/*,
    statics = component('statics')*/;

module.exports = function (router, mongoose) {

  var Group = mongoose.model('group'),
      Profile = mongoose.model('profile');

  /**
   * Create new group
   */
  router.post('/create', function(req, res, next) {

    var creator = req.session.user._id,
        members = req.body.members,
        group, name = req.body.name,

        saveGroup = function(){

          group.save(function(err) {

            if (err) {
              next(err);
            } else {

              debug('Saved group %s with %s new members' , group._id, group.members.length);
              res.status(201).send(group._id);

            }
          });
        };

    if (name) {

      new Profile({  name : name }).

      save(function(err, profile) {

        if (err) {
          next(err);

        } else {

          group =  new Group({
            profile : profile._id,
            admin : creator
          });

          group.members.push(creator);

          if (members && members.length) { /** Check if are member ids to save */

            /** Prevent a mistype error */
            if (typeof members === 'string') {
              members = [members];
            }

            relations.contact(creator, function(relation){

              members.forEach(function(member){

                if (mongoose.Types.ObjectId.isValid(member)) {

                  if (relation.isContact(member)) {

                    debug('Pushing %s into group members', member);
                    group.members.push(member);

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

    var adder = req.session.user._id,
        group = req.params.groupId,
        members = req.body.members, 
        saved = 0;

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

                    saved += 1;
                    debug('Pushing %s into group %s members', member, group._id);
                    group.members.push(member);

                  } else {
                    debug('User %s already belongs to the group %s' , member, group._id);
                  }   
                } else {
                  debug('User %s and %s are not contacts with each other', adder, member);
                }
              });

              group.save(function(err) {
                if (err) {
                  next(err);

                } else {

                  debug('Saved group %s with %s new members' , group._id, saved);
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

    var toRemove, removed = 0,
        lostAdmin = false,
        remover = req.session.user._id, 
        group = req.params.groupId,
        members = req.body.members;

    if (members && members.length) { 

      /** Prevent a mistype error */
      if (typeof members === 'string') {
        members = [members];
      }

      relations.membership(group, function(membership) {

        group = membership.group; /** The group model */

        if(group) { 

          remover = membership.isMember(remover);

          if (remover) { /** Check if remover is part of group */

            members.forEach(function(member) {

              toRemove = membership.isMember(member);

              if (toRemove) { /** Check if user to remove is member of group */

                /** Check if remover has enough privileges */
                if (membership.isAdmin(remover.member) || JSON.stringify(member) === JSON.stringify(remover.member)) { 

                  removed += 1;
                  debug('User %s removed from group %s' , member, group._id);
                  group.members.splice(toRemove.index, 1); /** Remove user from members array */

                  if (membership.isAdmin(toRemove)) {
                    lostAdmin = true;
                  }

                } else {
                  debug('User %s does not have enough privileges in group %s', remover.member, group._id);
                }
              } else {
                debug('No user with id %s found in group %s' , member, req.params.groupId);
              }
            });

            if (group.members.length > 0) {

              if (lostAdmin) {
                group.admin = group.members[0];
              }

              group.save(function(err) {
                if (err) {
                  next(err);

                } else {

                  debug('%s of %s members removed from group %s' , removed, members.length, group._id);
                  res.send(removed + ' of ' + members.length + ' members removed from group ' + group._id);

                }
              });

            } else {

              res.sendStatus(410);

              Group.remove({_id : group._id}, function(err){
                if(err) { 
                  debug(err);
                }

              });

            }
          } else {
            debug('User %s was not found in group %s' , req.session.user._id, group._id);
            res.sendStatus(403);
          }
        } else {
          debug('No group found with id %s' , req.params.groupId);
          res.sendStatus(404);
        }
      });
    } else {
      res.sendStatus(400);
    }

  });

  /**
   * Change group admin
   */
  router.get('/:groupId/changeAdmin/:id', function(req, res, next) {

    var group = req.params.groupId,
        sessionUser = req.session.user._id,
        user = req.params.id;

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

                debug('The group %s, has a new admin with id %s' , group._id, user);
                res.send('The group ' + group._id + ' has a new admin with id ' + user);

              }
            });
          } else {
            debug('No user with id %s found in group %s' , req.params.id, req.params.groupId);
            res.sendStatus(400);
          }
        } else {
          res.sendStatus(403);
        }
      } else {
        debug('No group found with id %s' , req.params.groupId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get group members
   */
  router.get('/:groupId/members', function(req, res, next) {

    Group.

    findOne().

    where('_id', req.params.groupId).

    where('members', req.session.user._id).

    deepPopulate('members.profile').

    exec(function(err, group) {

      if (err) {
        if (err.name && err.name === 'CastError') { 
          res.sendStatus(400);
        } else {
          next(err);
        }
      } else if (group) {

        res.send(group.members);

      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get user groups
   */
  router.get('/me', function(req, res, next) {

    Group.

    find().

    where('members', req.session.user._id).

    sort('created').

    select('id admin profile members created').

    populate('profile').

    exec(function(err, groups) {

      if (err) {
        next(err);
      } else if (groups) {

        res.send(groups);

      } else {
        res.sendStatus(404);
      }
    });

  });

};