'use strict';

var debug = require('debug')('app:api:profiles');

var gridfs = component('gridfs');

module.exports = function(router, mongoose) {

  var Profile = mongoose.model('profile');

  /**
   * Update Profile linked to User.
   *
   * @type Express Middleware.
   */
  router.put('/', function(req, res, next) {

    Profile.findById(req.session.user.profile._id, function(err, profile) {
      if (err) {
        return next(err);
      }

      if (!profile) {
        debug('No profile found for user %s', req.session.user._id);
        return res.sendStatus(404);
      }

      profile.name = (req.body.name && req.body.name !== 'own' && req.body.name) || profile.name;

      profile.birthdate = req.body.birthdate || profile.birthdate;

      profile.gender = req.body.gender || profile.gender;

      profile.location = req.body.location || profile.location;

      profile.save(function(err) {
        if (err) {
          if (err.name && err.name === 'CastError') {
            res.sendStatus(400);
          } else {
            next(err);
          }
        } else {

          res.sendStatus(204);

        }
      });
    });

  });

  /**
   * Upload a picture.
   *
   * @type Express Middleware.
   */
  router.post('/pictures', function(req, res, next) {

    var saved = 0;
    var profile; /* This is the target schema */

    /**
     * Save the profile.
     */
    function saveProfile() {

      profile.save(function(err) {
        if (err) {
          return next(err);
        }

        res.end();

      });
    }

    /**
     * Store each picture in mongo and save the ids.
     */
    function savePictures() {

      function onclose(fsFile) {

        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        profile.pictures.unshift(fsFile._id);

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

    Profile.findById(req.session.user.profile._id).
    exec(function(err, data) {
      if (err) {
        return next(err);
      }

      if (!data) {
        return res.sendStatus(404);
      }

      profile = data;

      if (req.files && req.files.length) { /* If there are any files, save them */
        savePictures();
      } else { /* If not, just save the profile */
        debug('No files saved');
        saveProfile();
      }
    });

  });

  /**
   * Choose main profile picture.
   *
   * @type Express Middleware.
   */
  router.put('/pictures/:id', function(req, res, next) {

    var picture = req.params.id;
    var index;

    Profile.findById(req.session.user.profile._id).
    exec(function(err, profile) {
      if (err) {
        return next(err);
      }

      if (!profile) {
        return res.sendStatus(404);
      }

      index = profile.pictures.indexOf(picture);

      if (index < 0) {
        return res.sendStatus(400);
      }

      profile.pictures.splice(index, 1);
      profile.pictures.unshift(picture);

      profile.save(function(err) {
        if (err) {
          return next(err);
        }

        res.sendStatus(204);

      });
    });

  });

};
