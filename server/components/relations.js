'use strict';

var debug = require('debug')('app:relations');
var mongoose = require('mongoose');
var _ = require('underscore');

var statics = component('statics');

var Contact = mongoose.model('contact');
var Meeting = mongoose.model('meeting');
var Group = mongoose.model('group');
var Task = mongoose.model('task');

/**
 * Get a Contact document and provide convenient methods.
 *
 * @param {ObjectID} id The id of the User.
 * @param {Function} cb The callback function.
 *
 * @returns {Object} relation Contains the Contact and the isContact method.
 */
function contact(id, cb) {

  var i;

  var relation = {

    contact: null,

    /**
     * Look for an active contact in the User contacts array.
     *
     * @param {ObjectID} id The id of the contact to check.
     * @param {Boolean} nonActive If true, check for a non-active contact.
     *
     * @return {Object} contact The contact object and
     * it's index in the contacts array.
     */
    isContact: function(id, nonActive) {

      var contact = null;

      if (relation.contact) {

        if (relation.contact.contacts.length) {

          for (i = 0; i < relation.contact.contacts.length; i++) {

            if (JSON.stringify(relation.contact.contacts[i].user) === JSON.stringify(id)) {

              /** Is an active contact */
              if (_.isEqual(relation.contact.contacts[i].state, statics.model('state', 'active')._id)) {

                contact = relation.contact.contacts[i].toObject();
                contact.index = i;

                /** Check the contact state looks redundant given that it's already in the contacts array */
              } else if (nonActive && (_.isEqual(relation.contact.contacts[i].state, statics.model('state', 'pending')._id) || _.isEqual(relation.contact.contacts[i].state, statics.model('state', 'disabled')._id))) {
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

  Contact.findOne().

  where('user', id).

  exec(function(err, contact) {
    if (cb) {

      if (err) {
        return cb(err, null);
      }

      relation.contact = contact;

      cb(null, relation);

    } else {
      debug('Error! No callback provided');
    }
  });

}

/**
 * Get a Group document and provide convenient methods.
 *
 * @param {ObjectID} id The id of the Group.
 * @param {Function} cb The callback function.
 *
 * @returns {Object} relation Contains the Group and
 * the isMember, wasMember and cleanMembers methods.
 */
function membership(id, cb) {

  var i;

  var relation = {

    group: null,

    /**
     * Check if a member is the admin of the Group.
     *
     * @param {ObjectID} id The id of the member to check.
     *
     * @return {Boolean} isAdmin.
     */
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

    /**
     * Look for a User in the Group members array.
     *
     * @param {ObjectID} id The id of the User to check.
     *
     * @return {Object} member The member object and
     * it's index in the Group members array.
     */
    isMember: function(id) {

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

    /**
     * Look for a non-active member in the Group members array.
     *
     * @param {ObjectID} id The id of the member to check.
     *
     * @return {Object} member The member object and
     * it's index in Group the members array.
     */
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

    /**
     * Remove all non-active members in the Group members array.
     */
    cleanMembers: function() {

      var i;

      if (relation.group) {

        for (i = 0; i < relation.group.members.length; i++) {

          if (relation.group.members[i].left.length && relation.group.members[i].joined.length === relation.group.members[i].left.length) {

            relation.group.members.splice(i, 1);
            i -= 1;
          }
        }
      } else {
        debug('Error! No group found');
      }
    }

  };

  Group.findById(id, function(err, group) {
    if (cb) {

      if (err) {
        return cb(err, null);
      }

      relation.group = group;

      cb(null, relation);

    } else {
      debug('No callback provided');
    }
  });

}

/**
 * Get a Task document and provide convenient methods.
 *
 * @param {ObjectID} id The id of the Task.
 * @param {Function} cb The callback function.
 *
 * @returns {Object} relation Contains the Task and the isCreator,
 * isCollaborator, wasCollaborator and cleanCollaborators methods.
 */
function collaboration(id, cb) {

  var i;

  var relation = {

    task: null,

    /**
     * Check if a User is the creator of the Task.
     *
     * @param {ObjectID} id The id of the User to check.
     *
     * @return {Boolean} isCreator.
     */
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

    /**
     * Look for an active collaborator in the Task collaborators array.
     *
     * @param {ObjectID} id The id of the collaborator to check.
     *
     * @return {Object} collaborator The collaborator object and
     * it's index in the collaborators array.
     */
    isCollaborator: function(id) {

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

    /**
     * Look for a non-active collaborator in the Task collaborators array.
     *
     * @param {ObjectID} id The id of the collaborator to check.
     *
     * @return {Object} collaborator The collaborator object and
     * it's index in the collaborators array.
     */
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
    },

    /**
     * Remove all non-active collaborators from the Task collaborators array.
     */
    cleanCollaborators: function() {

      var i;

      if (relation.task) {

        for (i = 0; i < relation.group.members.length; i++) {

          if (relation.group.members[i].left.length && relation.group.members[i].joined.length === relation.group.members[i].left.length) {

            relation.group.members.splice(i, 1);
            i -= 1;
          }
        }
      } else {
        debug('Error! No task found');
      }
    }

  };

  Task.findOne().

  where('_id', id).
  where('deleted', null).

  exec(function(err, task) {
    if (cb) {

      if (err) {
        return cb(err, null);
      }

      relation.task = task;

      cb(null, relation);

    } else {
      debug('No callback provided');
    }
  });

}

/**
 * Get a Meeting document and provide convenient methods.
 *
 * @param {ObjectID} id The id of the Meeting.
 * @param {Function} cb The callback function.
 *
 * @returns {Object} relation Contains the Meeting
 * and the isAttendant and wasAttendant methods.
 */
function attendance(id, cb) {

  var i;

  var relation = {

    meeting: null,

    /**
     * Look for an active attendant in the Meeting attendants array.
     *
     * @param {ObjectID} id The id of the attendant to check.
     *
     * @return {Object} attendant The attendant object and
     * it's index in the attendants array.
     */
    isAttendant: function(id) {

      var attendant = null;

      if (relation.meeting) {

        for (i = 0; i < relation.meeting.attendants.length; i++) {

          if (JSON.stringify(relation.meeting.attendants[i].user) === JSON.stringify(id)) {

            if (!relation.meeting.attendants[i].left.length || relation.meeting.attendants[i].left.length < relation.meeting.attendants[i].joined.length) {

              attendant = {
                attendant: relation.meeting.attendants[i],
                index: i
              };

            }
          }
        }
      } else {
        debug('Error! No meeting found');
      }

      return attendant;
    },

    /**
     * Look for a non-active attendant in the Meeting attendants array.
     *
     * @param {ObjectID} id The id of the attendant to check.
     *
     * @return {Object} attendant The attendant object and
     * it's index in the attendants array.
     */
    wasAttendant: function(id) {

      var attendant = null;

      if (relation.meeting) {

        for (i = 0; i < relation.meeting.attendants.length; i++) {

          if (JSON.stringify(relation.meeting.attendants[i].user) === JSON.stringify(id)) {

            attendant = {
              user: relation.meeting.attendants[i].user,
              index: i
            };

            break;
          }
        }
      } else {
        debug('Error! No meeting found');
      }

      return attendant;
    }

  };

  Meeting.findOne().

  where('_id', id).
  where('deleted', null).

  exec(function(err, meeting) {
    if (cb) {

      if (err) {
        return cb(err, null);
      }

      relation.meeting = meeting;

      cb(null, relation);

    } else {
      debug('No callback provided');
    }
  });

}

module.exports = {

  contact: contact,

  attendance: attendance,

  membership: membership,

  collaboration: collaboration

};
