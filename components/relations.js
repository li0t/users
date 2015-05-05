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

function contact(userId, cb) { /** Returns a contact model with a isContact method */

  var  i, 

      relation = {

        contact : null,

        isContact : function(id, pending) { /** Looks for an active contact, if pending === true, looks for a pending contact */

          var contact = null;

          if (relation.contact) {

            if (relation.contact.contacts.length) {

              for (i = 0; i < relation.contact.contacts.length; i++) {

                if (JSON.stringify(relation.contact.contacts[i].user) === JSON.stringify(id)) {

                  if (_.isEqual(relation.contact.contacts[i].state, statics.model('state', 'active')._id)) { /** Is an active contact */
                    contact =  relation.contact.contacts[i];

                  } else if (pending && _.isEqual(relation.contact.contacts[i].state, statics.model('state', 'pending')._id)) {/** Is a pending contact */
                    contact =  relation.contact.contacts[i];

                  }
                  break;
                }
              }
            } else {
              debug('Contact list %s has no contacts', contact._id);
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
  exec(function(err, contact){

    if(err){
      debug(err);

    } else if (contact){

      relation.contact = contact;

    } else {
      debug('Contact list for user %s was not found', userId);
    }

    if(cb){
      cb(relation);
    } else {
      debug('Error! No callback provided');
    }

  });

}


function membership(groupId, cb) {

  var i, 

      relation = {

        group : null,

        isMember : function(id) { /** Looks for a member of a group */

          var member = null;

          if (relation.group) {

            for (i = 0; i < relation.group.members.length; i++) {

              if (JSON.stringify(relation.group.members[i]) === JSON.stringify(id)) {

                member = { member:  relation.group.members[i] , index : i };

                if (JSON.stringify(relation.group.admin) === JSON.stringify(id)) {
                  member.isAdmin = true;
                } 
                break;
              }
            }
          } else {
            debug('Error! No group found');
          }

          return member;
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

    if(cb){
      cb(relation);
    } else {
      debug('No callback provided');
    }
  });

}

function collaboration(taskId, cb) {

  var i, 

      relation = {

        task : null,

        isCreator : function(id){
          
          var isCreator = false;
          
          if (relation.task) {
            
            if (id === relation.task.creator) {
              isCreator = true;
            }
            
          } else {
            debug('Error! No task found');
          }
          
          return isCreator;
          
        },

        isCollaborator : function(id) { /** Looks for a member of a task */

          var collaborator = null;

          if (relation.task) {

            for (i = 0; i < relation.task.users.length; i++) {

              if (JSON.stringify(relation.task.users[i]) === JSON.stringify(id)) {

                collaborator = { collaborator:  relation.task.users[i] , index : i };

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

    if(cb){
      cb(relation);
    } else {
      debug('No callback provided');
    }
  });

}

module.exports = {

  contact : contact,

  membership : membership,

  collaboration: collaboration

};