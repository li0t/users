'use strict';

var debug = require('debug')('app:api:groups:profiles');

var relations = component('relations');
var gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Profile = mongoose.model('profile');

  /**
   * Update Group Profile.
   *
   * @type Express Middleware.
   */
  router.put('/:id', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;

    relations.membership(group, function(err, membership) {

      if (err || !membership.group) {
        debug('No group found with id %s', req.params.id);
        return res.sendStatus(404);
      }

      group = membership.group;

      if (!membership.isAdmin(user)) {
        debug('User %s is not admin of group %s', user, group._id);
        return res.sendStatus(403);
      }

      Profile.findById(group.profile, function(err, profile) {
        if (err) {
          return next(err);
        }

        profile.name = (req.body.name && req.body.name !== 'own' && req.body.name) || profile.name;

        profile.location = req.body.location || profile.location;

        profile.save(function(err) {
          if (err) {
            return next(err);
          }

          res.sendStatus(204);

        });
      });
    });

  });

  /**
   * Upload a Group Profile picture.
   *
   * @type Express Middleware.
   */
  router.post('/:id/pictures', function(req, res, next) {

    var user = req.session.user._id;
    var group = req.params.id;
    var profile; /* This is the target schema */
    var saved = 0;

    /**
     * Create the document with the saved File ids
     */
    function saveProfile() {

      profile.save(function(err) {
        if (err) {
          return next(err);
        }
        res.sendStatus(204);

      });
    }

    function savePictures() {

      function onclose(fsFile) {

        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        profile.pictures.push(fsFile._id);

        saved += 1;

        /* Check if all files where streamed to the database */
        if (saved === req.files.length) {
          debug('All files saved');
          saveProfile();
        }
      }

      function onerror(err) {
        debug('Error streaming file!');
        next(err);
      }

      req.files.forEach(function(file) {
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

    relations.membership(group, function(err, membership) {

      if (err || !membership.group) {
        debug('No group found with id %s', req.params.id);
        return res.sendStatus(404);
      }

      group = membership.group; /** The group model */

      if (!membership.isMember(user)) {
        debug('User %s is not member of group %s', user, group._id);
        return res.sendStatus(403);
      }

      Profile.findById(group.profile, function(err, data) {

        profile = data;

        if (req.files && req.files.length) { /* If there are any files, save them */
          savePictures();
        } else { /* If not, just save the profile */
          debug('No files saved');
          saveProfile();
        }
      });
    });

  });

};
