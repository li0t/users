/* jshint node: true */
'use strict';

var   // _ = require('underscore'),
debug = require('debug')('app:api:groups');


module.exports = function (router, mongoose) {

  var Group = mongoose.model('group'),
      User = mongoose.model('user'),
      Profile = mongoose.model('profile');


  /**
   * Create new group
   */
  router.post('/create', function(req, res, next) {

    new Profile({
      name : req.body.name
    }).

    save(function(err, profile){

      if (err) {
        next(err);
      } else {

        var group =  new Group({
          profile : profile._id,
          admin : req.session.user._id
        });

        group.members.push(req.session.user._id);

        group.save(function(err) {

          if (err) {
            next(err);
          } else {

            debug('Saved group with id %s' , group._id);
            res.status(201).send(group._id);

          }
        });
      }
    });

  });

  /**
   * Add member to a group
   */
  router.get('/:groupId/addMember/:id', function(req, res, next) {

    var i, index = -1;

    Group.findById(req.params.groupId, function(err, group) {

      if (err) {
        next(err);
      } else if (group) {

        if (JSON.stringify(group.admin) === JSON.stringify(req.session.user._id)) { /** Check if logged user is the group admin */

          User.findById(req.params.id, function(err, user) {

            if (err) {
              next(err);
            } else if (user) {

              for (i = 0; i < group.members.length; i++) {

                if (JSON.stringify(group.members[i]) === JSON.stringify(user._id)) { /** Look for user index in members array */
                  index = i;
                  break;
                }
              }

              if (index === -1) {

                group.members.push(user._id);

                group.save(function(err) {

                  if (err) {
                    next(err);
                  } else {

                    debug('User %s added to group %s' , group._id, user._id);
                    res.sendStatus(204);

                  }
                });
              }else {
                res.status(409).send('That user already belongs to the group');
              }

            } else {
              debug('No user found with id %s' , req.params.id);
              res.sendStatus(404);
            }
          });
        } else {
          res.sendStatus(403);
        }
      } else {
        debug('No group found with id %s' , req.params.gruopId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Remove member from group
   */
  router.get('/:groupId/removeMember/:id', function(req, res, next) {

    var i, index = -1;

    Group.findById(req.params.groupId, function(err, group) {

      if (err) {
        next(err);
      } else if (group) {

        /** Check if the user removing is the group admin or itself */
        if (JSON.stringify(group.admin) === JSON.stringify(req.session.user._id) || req.session.user._id === req.params.id) { 

          for (i = 0; i < group.members.length; i++) {

            if (JSON.stringify(group.members[i]) === JSON.stringify(req.params.id)) { /** Look for user index in members array */
              index = i;
              break;
            }
          }

          if (index > -1) { /** Check if user was found */

            group.members.splice(index, 1); /** Remove user from members array */

            group.save(function(err) {

              if (err) {
                next(err);
              } else {

                debug('User %s removed from group %s' , group._id, req.params.id);
                res.sendStatus(204);

              }
            });
          } else {
            debug('No user with id %s found in group %s' , req.params.id, req.params.gruopId);
            res.sendStatus(404);
          }
        } else {
          res.sendStatus(403);
        }
      } else {
        debug('No group found with id %s' , req.params.gruopId);
        res.sendStatus(404);
      }
    });

  });

  /**
   * Change group admin
   */
  router.get('/:groupId/changeAdmin/:id', function(req, res, next) {

    var i, index = -1;

    Group.findById(req.params.groupId, function(err, group) {

      if (err) {
        next(err);
      } else if (group) {

        if (JSON.stringify(group.admin) === JSON.stringify(req.session.user._id)) { /** Check if logged user is the group admin */

          for (i = 0; i < group.members.length; i++) {

            if (JSON.stringify(group.members[i]) === JSON.stringify(req.params.id)) { /** Look for user index in members array */
              index = i;
              break;
            }
          }

          if (index > -1) { /** Check if user was found */

            group.admin = req.params.id;

            group.save(function(err) {

              if (err) {
                next(err);
              } else {

                debug('The group %s, has a new admin with id %s' , group._id, req.params.id);
                res.sendStatus(204);

              }
            });
          } else {
            debug('No user with id %s found in group %s' , req.params.id, req.params.gruopId);
            res.sendStatus(404);
          }
        } else {
          res.sendStatus(403);
        }
      } else {
        debug('No group found with id %s' , req.params.gruopId);
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
        next(err);
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

    select('id profile members created').

    populate('profile').

    exec(function(err, group) {

      if (err) {
        next(err);
      } else if (group) {

        res.send(group);

      } else {
        res.sendStatus(404);
      }
    });

  });

};