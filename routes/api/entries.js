/* jshint node: true */
/* global component */
'use strict';

var _ = require('underscore'),
    debug = require('debug')('app:api:entries'),
    States = {
      Active: null,
      Pending: null,
      Disabled: null
    };


var gridfs = component('gridfs');

module.exports = function (router, mongoose) {

  var Entry = mongoose.model('entry'),
      Group = mongoose.model('group'),
      Contact = mongoose.model('contact'),
      Tag = mongoose.model('tag');

  /** 
   * Looks for statics states and saves the ids
   * FALLS WHEN THERE ARE NO STATICS INSTALLED
   */
  (function getStates() {
    var
    Sts = mongoose.model('static.state'),
        state;

    function lookup(name) {
      Sts.findOne({
        name: name
      }, function (err, found) {
        if (err) {
          debug('Error! : %s', err);
        } else {
          States[name] = found._id;
        }
      });
    }

    for (state in States) {
      if (States.hasOwnProperty(state)) {
        lookup(state);
      }
    }
  })();

  /**
   * Create a new entry
   */
  router.post('/create/:groupId?', function (req, res, next) {

    var entry, /* This is the target schema */
        group = req.params.groupId || null,
        i, isMember = false,
        tagsSaved = 0;

    /**
     * Save the document
     */
    function saveEntry() {
      entry.save(function (err, entry) {
        if (err) {
          next(err);
        } else {
          res.status(201).send(entry._id);
        }
      });
    }

    /** 
     * Lookup for tags provided by the user
     * If one is not found create a new tag 
     */
    function saveTags() {

      /* Check if all tags were found and/or created */
      function onTagReady(tag) {
        entry.tags.push(tag.name);

        tagsSaved += 1;

        if (tagsSaved === req.body.tags.length) {
          saveEntry();
        }
      }

      /* Convert the tags string to array if necessary */
      if (typeof req.body.tags === 'string') {
        req.body.tags = [req.body.tags];
      }
      req.body.tags.forEach(function (tag) {
        Tag.findOne()
          .where('name', tag)
          .exec(function (err, found) {
          if (err) {
            debug('Error! : %s', err);
          } else if (found) {
            debug('Tag found : %s' , found);
            onTagReady(found);
          } else {
            debug('Creating new Tag : %s', tag);
            new Tag({
              name: tag
            }).save(function (err, newTag) {
              if (err) {
                debug('Error! : %s', err);
              } else {
                onTagReady(newTag);
              }
            });
          }
        });
      });
    }

    function createEntry() {

      new Entry({
        user: req.session.user._id,
        group : group,
        title: req.body.title,
        content: req.body.content /* Markdown text */ 
      }).

      save(function (err, data) {
        if (err) {
          next(err);
        } else {
          entry = data;
          if (req.body.tags && req.body.tags.length) { /* If there are any tags, save them */
            saveTags();
          } else { /* If not, just save the entry */
            saveEntry();
          }
        }
      });

    }

    if (group) {

      Group.findById(group, function(err, found) {
        if (err) {

          if (err.name && err.name === 'CastError') {
            res.sendStatus(400);
          } else {
            next(err);
          }

        } else if (found) {

          for (i = 0; i < group.members.length; i++) {
            if (JSON.stringify(group.members[i]) === JSON.stringify(req.session.user.id)) {
              isMember = true;
              break;
            }
          }

          if (isMember) {

            createEntry();

          } else {
            debug('User %s is not part of group %s',req.session.user.id, group._id);
            res.sendStatus(403);
          }
        } else {
          res.status(404).send('No group found with id ' + group);
        }
      });

    } else {
      createEntry();
    }

  });

  /**
   * Upload pictures to an entry
   */ 
  router.post('/:id/pictures', function (req, res, next) {

    var entry, /* This is the target schema */
        picturesSaved = 0;

    /**
     * Save the document
     */
    function saveEntry() {
      entry.save(function (err, entry) {
        if (err) {
          next(err);
        } else {
          res.status(201).send(entry._id);
        }
      });
    }


    /**
     * Save pictures with gridfs and store de ids
     */
    function savePictures() {

      function onclose(fsFile) {
        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        entry.pictures.push(fsFile._id); 

        picturesSaved += 1;

        /* Check if all pictures were streamed to the database */
        if (picturesSaved === req.files.length) {
          debug('All files saved');
          saveEntry();
        }
      }

      function onerror(err) {
        debug('Error streaming file!');
        next(err);
      }

      req.files.forEach(function (file) {
        debug('Saving %s', file.filename);

        var writestream = gridfs.save(file.data, {
          content_type: file.mimetype,
          filename: file.filename,
          mode: 'w'
        });
        writestream.on('close', onclose); /* The stream has finished */
        writestream.on('error', onerror); /* Oops! */
      });
    }

    Entry.
    findOne().
    where('_id', req.params.id).
    where('user', req.session.user._id).

    exec(function (err, data) {
      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (data) {
        entry = data;
        if (req.files && req.files.length) { /* If there are any files, save them */
          savePictures();
        } else { /* If not, just save the document */
          saveEntry();
        }
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get an entry
   */
  router.get('/:id', function (req, res, next) {

    var i, isContact = false;

    Entry.
    findById(req.params.id).    
    populate('pictures'). /* Retrieves data from linked schemas */

    exec(function (err, entry) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else if (entry) {

        Contact.
        findOne().
        where('user', entry.user).
        exec(function(err, contact){

          if(err){
            next(err);
          } else {

            for (i = 0; i < contact.contacts.length; i++) {
              if (JSON.stringify(contact.contacts[i].user) === JSON.stringify(req.session.user.id)) {
                if (_.isEqual(contact.contacts[i].state, States.Active)) {
                  isContact = true;
                  break;
                }
              }
            }

            if (isContact || JSON.stringify(entry.user) === JSON.stringify(req.session.user.id)) {

              res.send(entry);

            } else {
              debug('User %s and %s are not contacts with each other', entry.user, req.session.user.id);
              res.sendStatus(403); 
            }
          }
        });
      } else {
        res.sendStatus(404);
      }
    });

  });

  /**
   * Get entries of an user
   */
  router.get('/user/:id', function (req, res, next) {

    var i, user = req.params.id , isContact = false;

    Contact.

    findOne().
    where('user',user).

    exec(function(err, contact) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else {

        for (i = 0; i < contact.contacts.length; i++) {
          if (JSON.stringify(contact.contacts[i].user) === JSON.stringify(req.session.user.id)) {
            if(_.isEqual(contact.contacts[i].state, States.Active)){
              isContact = true;
              break;
            }
          }
        }

        if (isContact || user === req.session.user.id) {

          Entry.

          find().
          where('user', req.params.id).

          populate('pictures'). /* Retrieves data from linked schemas */
          sort('created').

          exec(function (err, entries) {
            if (err) {
              next(err);

            } else if (entries && entries.length) {

              res.send(entries);

            } else {
              res.sendStatus(404);
            } 
          });
        } else {
          debug('User %s and %s are not contacts with each other', user, req.session.user.id);
          res.sendStatus(403); 
        }
      }
    });

  });

  /**
   * Get entries with files of an user
   */
  router.get('/user/:id/files', function (req, res, next) {

    var i, user = req.params.id , isContact = false;

    Contact.

    findOne().
    where('user',user).

    exec(function(err, contact) {

      if(err){

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else {

        for (i = 0; i < contact.contacts.length; i++) {
          if (JSON.stringify(contact.contacts[i].user) === JSON.stringify(req.session.user.id)) {
            if (_.isEqual(contact.contacts[i].state, States.Active)) {
              isContact = true;
              break;
            }
          }
        }

        if (isContact || user === req.session.user.id) {

          Entry.

          find( { $where : 'this.pictures.length > 0' } ).
          where('user', req.params.id).

          populate('pictures'). /* Retrieves data from linked schemas */
          sort('created').

          exec(function (err, entries) {
            if (err) {
              next(err);

            } else if (entries && entries.length) {
              res.send(entries);

            } else {
              res.sendStatus(404);
            }
          });
        } else {
          debug('User %s and %s are not contacts with each other', user, req.session.user.id);
          res.sendStatus(403); 
        }
      }
    });

  });

  /**
   * Get entries of a group
   */
  router.get('/group/:id', function (req, res, next) {

    var i, group = req.params.id, isMember = false;

    Group.findById(group, function(err, group) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else {

        for (i = 0; i < group.members.length; i++) {
          if (JSON.stringify(group.members[i]) === JSON.stringify(req.session.user.id)) {
            isMember = true;
            break;
          }
        }

        if (isMember) {

          Entry.

          find().
          where('group', group).

          populate('pictures'). /* Retrieves data from linked schemas */
          sort('created').

          exec(function (err, entries) {
            if (err) {
              next(err);

            } else if (entries && entries.length) {
              res.send(entries);

            } else {
              res.sendStatus(404);
            }
          });
        } else {
          debug('User %s is not part of group %s',req.session.user.id, group._id);
          res.sendStatus(403);
        }
      }
    });
    
  });

  /**
   * Get entries with files of a group
   */
  router.get('/group/:id/files', function (req, res, next) {

    var i, group = req.params.id, isMember = false;

    Group.findById(group, function(err, group) {

      if (err) {

        if (err.name && err.name === 'CastError') {
          res.sendStatus(400);
        } else {
          next(err);
        }

      } else {

        for (i = 0; i < group.members.length; i++) {
          if (JSON.stringify(group.members[i]) === JSON.stringify(req.session.user.id)) {
            isMember = true;
            break;
          }
        }

        if (isMember) {

          Entry.

          find( { $where : 'this.pictures.length > 0' } ).

          where('group', req.params.id).

          populate('pictures'). /* Retrieves data from linked schemas */

          sort('created').

          exec(function (err, entries) {
            if (err) {
              next(err);

            } else if (entries && entries.length) {

              res.send(entries);

            } else {
              res.sendStatus(404);
            }
          });
        } else {
          debug('User %s is not part of group %s',req.session.user.id, group._id);
          res.sendStatus(403);
        }
      }
    });

  });

};