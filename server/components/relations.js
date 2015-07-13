'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
var debug = require('debug')('app:relations');

var statics = component('statics');

var Contact = mongoose.model('contact');
var Group = mongoose.model('group');
var Task = mongoose.model('task');

function contact(userId, cb) { /** Returns a relation object with the contact model and a isContact method */

  var i;

  var relation = {

    contact: null,

    isContact: function(id, notActive) { /** Looks for an active contact, if notActive === true, looks for a pending or disabled contact also */

      var contact = null;

      if (relation.contact) {

        if (relation.contact.contacts.length) {

          for (i = 0; i < relation.contact.contacts.length; i++) {

            if (JSON.stringify(relation.contact.contacts[i].user) === JSON.stringify(id)) {

              if (_.isEqual(relation.contact.contacts[i].state, statics.model('state', 'active')._id)) { /** Is an active contact */

                contact = relation.contact.contacts[i].toObject();
                contact.index = i;

              } else if (notActive && (_.isEqual(relation.contact.contacts[i].state, statics.model('state', 'pending')._id) || _.isEqual(relation.contact.contacts[i].state, statics.model('state', 'disabled')._id))) {
                contact = relation.contact.contacts[i].toObject();
                contact.index = i;

              }
              break;
            }
          }
        } else {
          debug('User %s has no contacts', relation.contact.user);
        }
      } else {
        debug('Error! No contact list found');
      }

      return contact;
    }

  };

  Contact.

  findOne().

  where('user', userId).

  exec(function(err, contact) {

    if (err) {
      cb(err, null);

    } else if (contact) {
      relation.contact = contact;

    } else {
      debug('Contact list for user %s was not found', userId);
    }

    if (cb) {
      cb(null, relation);

    } else {
      debug('Error! No callback provided');
    }

  });

}


function membership(groupId, cb) { /** Returns a relation object with the group model and a isMember method */

  var i;

  var relation = {

    group: null,

    isAdmin: function(id) {

      var isAdmin = false;

      if (relation.group) {

        if (JSON.stringify(relation.group.admin) === JSON.stringify(id)) {
          isAdmin = true;
        }

      } else {
        debug('Error! No group found');
      }

      return isAdmin;

    },

    isMember: function(id) { /** Looks for a member of a group */

      var member = null;

      if (relation.group) {

        for (i = 0; i < relation.group.members.length; i++) {

          if (JSON.stringify(relation.group.members[i].user) === JSON.stringify(id)) {

            if (!relation.group.members[i].left.length || relation.group.members[i].joined.length > relation.group.members[i].left.length) {

              member = {
                member: relation.group.members[i].user,
                index: i
              };
              break;

            }
          }
        }
      } else {
        debug('Error! No group found');
      }

      return member;
    },

    wasMember: function(id) {

      var member = null;

      if (relation.group) {

        for (i = 0; i < relation.group.members.length; i++) {

          if (JSON.stringify(relation.group.members[i].user) === JSON.stringify(id)) {

            member = {
              member: relation.group.members[i],
              index: i
            };

            break;
          }
        }
      } else {
        debug('Error! No group found');
      }

      return member;
    },

    cleanMembers: function() {

      var i;

      if (relation.group) {

        for (i = 0; i < relation.group.members; i++) {

          if (relation.group.members[i].left.length && relation.group.members[i].joined.length < relation.group.members[i].left.length) {

            relation.group.members.splice(i, 1);
            i -= 1;
          }
        }
      } else {
        debug('Error! No group found');
      }
    }
  };

  Group.findById(groupId, function(err, group) {

    if (err) {
      cb(err, null);

    } else if (group) {
      relation.group = group;

    } else {
      debug('No group found');
    }

    if (cb) {
      cb(null, relation);

    } else {
      debug('No callback provided');
    }
  });

}

function collaboration(taskId, cb) {

  var i;

  var relation = {

    task: null,

    isCreator: function(id) {

      var isCreator = false;

      if (relation.task) {

        if (JSON.stringify(relation.task.creator) === JSON.stringify(id)) {
          isCreator = true;
        }

      } else {
        debug('Error! No task found');
      }

      return isCreator;

    },

    isCollaborator: function(id) { /** Looks for a member of a task */

      var collaborator = null;

      if (relation.task) {

        for (i = 0; i < relation.task.collaborators.length; i++) {

          if (JSON.stringify(relation.task.collaborators[i].user) === JSON.stringify(id)) {

            if (!relation.task.collaborators[i].left.length || relation.task.collaborators[i].left.length < relation.task.collaborators[i].joined.length) {

              collaborator = {
                collaborator: relation.task.collaborators[i],
                index: i
              };

            }
          }
        }
      } else {
        debug('Error! No task found');
      }

      return collaborator;
    },

    wasCollaborator: function(id) {

      var collaborator = null;

      if (relation.task) {

        for (i = 0; i < relation.task.collaborators.length; i++) {

          if (JSON.stringify(relation.task.collaborators[i].user) === JSON.stringify(id)) {

            collaborator = {
              user: relation.task.collaborators[i].user,
              index: i
            };

            break;
          }
        }
      } else {
        debug('Error! No task found');
      }

      return collaborator;
    }

  };

  Task.

  findOne().

  where('_id', taskId).

  where('deleted', null).

  exec(function(err, task) {

    if (err) {
      cb(err, null);

    } else if (task) {
      relation.task = task;

    } else {
      debug('No task found');
    }

    if (cb) {
      cb(null, relation);

    } else {
      debug('No callback provided');
    }
  });

}

module.exports = {

  contact: contact,

  membership: membership,

  collaboration: collaboration

};
