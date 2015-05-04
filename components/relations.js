/* jshint node: true */
/* global component */
'use strict'; 

var mongoose = require('mongoose'),
    _ = require('underscore'),
    debug = require('debug')('app:relations');

var statics = component('statics');

var Contact = mongoose.model('contact'),
    Group = mongoose.model('group');

function contact(id1, id2, cb) {
  var i, 
      relation = {
        contact : null,
        isContact : false,
        state : null
      };

  Contact.
  findOne().
  where('user', id1).
  exec(function(err, contact){

    if(err){
      debug(err);

    } else if (contact){

      relation.contact = contact;

      for (i = 0; i < contact.contacts.length; i++) {

        if (JSON.stringify(contact.contacts[i].user) === JSON.stringify(id2)) {
          relation.state = contact.contacts[i].state;

          if (_.isEqual(contact.contacts[i].state, statics.model('state', 'active')._id)) {
            relation.isContact = true;
          }          
          break;
        }
      } 
      
    } else {
      debug('No contact found with id %s' , id1);
    }

    if(cb){
      cb(relation);
    } else {
      debug('No callback provided');
    }

  });

}


function membership(userId, groupId, cb) {
  var i, 
      relation = {
        group : null,
        isMember : false,
        isAdmin : false
      };


  Group.findById(groupId, function(err, group) {

    if (err) {
      debug(err);

    } else if (group) {

      relation.group = group;

      for (i = 0; i < group.members.length; i++) {

        if (JSON.stringify(group.members[i]) === JSON.stringify(userId)) {
          relation.isMember = true;

          if (JSON.stringify(group.admin) === JSON.stringify(userId)) {
            relation.isAdmin = true;
          } 
          break;
        }
      }

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

module.exports = {

  contact : contact,

  membership : membership

};