/* jshint node: true */
/* global component */
'use strict';

var mongoose = require('mongoose'),
  _ = require('underscore'),
  debug = require('debug')('app:relations');

var statics = component('statics');

var Contact = mongoose.model('contact'),
  Group = mongoose.model('group'),
  Task = mongoose.model('task');

function contact(userId, cb) { /** Returns a relation object with the contact model and a isContact method */

  var i,

    relation = {

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
      debug(err);

    } else if (contact) {

      relation.contact = contact;

    } else {
      debug('Contact list for user %s was not found', userId);
    }

    if (cb) {
      cb(relation);
    } else {
      debug('Error! No callback provided');
    }

  });

}


function membership(groupId, cb) { /** Returns a relation object with the group model and a isMember method */

  var i,

    relation = {

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

            if (JSON.stringify(relation.group.members[i]) === JSON.stringify(id)) {

              if (!member.left.length) {

                member = {
                  member: relation.group.members[i].user,
                  index: i
                };
                break;

              } else if (member.joined.length > member.left.length) {

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

        if (relation.group) {/* jshint node: true */
/* global component */
'use strict';

var mongoose = require('mongoose'),
  _ = require('underscore'),
  debug = require('debug')('app:relations');

var statics = component('statics');

var Contact = mongoose.model('contact'),
  Group = mongoose.model('group'),
  Task = mongoose.model('task');

function contact(userId, cb) { /** Returns a relation object with the contact model and a isContact method */

  var i,

    relation = {

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
      debug(err);

    } else if (contact) {

      relation.contact = contact;

    } else {
      debug('Contact list for user %s was not found', userId);
    }

    if (cb) {
      cb(relation);
    } else {
      debug('Error! No callback provided');
    }

  });

}


function membership(groupId, cb) { /** Returns a relation object with the group model and a isMember method */

  var i,

    relation = {

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

            if (JSON.stringify(relation.group.members[i]) === JSON.stringify(id)) {

              if (!member.left.length) {

                member = {
                  member: relation.group.members[i].user,
                  index: i
                };
                break;

              } else if (member.joined.length > member.left.length) {

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

            if (JSON.stringify(relation.group.members[i]) === JSON.stringify(id)) {

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

      }

    };

  Group.findById(groupId, function(err, group) {

    if (err) {
      debug(err);

    } else if (group) {

      relation.group = group;

    } else {
      debug('No group found');
    }

    if (cb) {
      cb(relation);
    } else {
      debug('No callback provided');
    }
  });

}

function collaboration(taskId, cb) {

  var i,

    relation = {

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

            if (JSON.stringify(relation.task.collaborators[i]) === JSON.stringify(id)) {

              collaborator = {
                collaborator: relation.task.collaborators[i],
                index: i
              };

            }
          }
        } else {
          debug('Error! No task found');
        }

        return collaborator;
      }
    };

  Task.findById(taskId, function(err, task) {

    if (err) {
      debug(err);

    } else if (task) {

      relation.task = task;

    } else {
      debug('No task found');
    }

    if (cb) {
      cb(relation);
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
            if (JSON.stringify(relation.group.members[i]) === JSON.stringify(id)) {

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

      }

    };

  Group.findById(groupId, function(err, group) {

    if (err) {
      debug(err);

    } else if (group) {

      relation.group = group;

    } else {
      debug('No group found');
    }

    if (cb) {
      cb(relation);
    } else {
      debug('No callback provided');
    }
  });

}

function collaboration(taskId, cb) {

  var i,

    relation = {

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

            if (JSON.stringify(relation.task.collaborators[i]) === JSON.stringify(id)) {

              collaborator = {
                collaborator: relation.task.collaborators[i],
                index: i
              };

            }
          }
        } else {
          debug('Error! No task found');
        }

        return collaborator;
      }
    };

  Task.findById(taskId, function(err, task) {

    if (err) {
      debug(err);

    } else if (task) {

      relation.task = task;

    } else {
      debug('No task found');
    }

    if (cb) {
      cb(relation);
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
