/* jshint node: true */
'use strict';

module.exports = function (router, mongoose) {

  var Entry = mongoose.model('entry');
  
  router.post('/picture', function (req, res, next) {

    var profile,
      saved = 0; /* This is the target schema */

    /**
     * Create the document with the saved File ids
     */
    function saveProfile() {
      profile.save(function (err) {
        if (err) {
          next(err);
        } else {
          res.status(204).end();
        }
      });
    }

    function savePictures() {
      function onclose(fsFile) {
        debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

        profile.pictures.push(fsFile._id); /* Add the picture's id to the profile.pictures array */

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

    Profile.findById(req.session.user._id, function (err, data) {
      if (err) {
        next(err);
      } else if (data) {
        profile = data;

        if (req.files && req.files.length) { /* If there are any files, save them */
          savePictures();
        } else { /* If not, just save the profile */
          saveProfile();
        }
      } else {
        res.status(400).end();
      }
    });

  });
  

  /**
   * Get entries base on tags 
   + Only works for a perfect match
   */
  router.get('/tags', function (req, res, next) {

    var tags = req.query.tags;

    /** 
     * Finds entries related with tags
     */
    function findEntries() {
      Entry.find()
        .where('tags', tags)
        .populate('tags')
        .exec(function (err, entries) {
          if (err) {
            next(err);
          } else if (entries && entries.length) {
            res.send(entries);
          } else {
            res.status(404).end();
          }
        });
    }

    /* Convert the tags string to array if necessary */
    if (typeof tags === 'string') {
      tags = [tags];
    }

    /* Check if there are entries-based-on-tags to find */
    if (Array.isArray(tags) && tags.length) {
      findEntries();
    } else {
      res.status(400).end();
    }

  });

  /**
   * Get entries base on tags
   * Returns every entry which contains any of the tags
   */
  router.get('/tags/any', function (req, res, next) {
    var tags = req.query.tags;

    function findEntries() {
      Entry
        .find({
          tags: {
            $in: tags
          }
        })
        .populate('tags')
        .exec(function (err, entries) {
          if (err) {
            next(err);
          } else if (entries && entries.length) {
            res.send(entries);
          } else {
            res.status(404).end();
          }
        });
    }

    /* Convert the tags string to array if necessary */
    if (typeof tags === 'string') {
      tags = [tags];
    }

    /* Check if there are entries to find */
    if (Array.isArray(tags) && tags.length) {
      findEntries();
    } else {
      res.status(400).end();
    }
  });
  
  /**
   * Get an entry
   */
  router.get('/:id', function (req, res, next) {
    Entry.findById(req.params.id)
      .deepPopulate('tags pictures user.state user.profile') /* Retrieves data of linked schemas */
      .exec(function (err, entry) {
        if (err) {
          next(err);
        } else if (entry) {
          res.send(entry);
        } else {
          res.status(400).end();
        }
      });
  });

    /**
   * Get entries of an user
   */
  router.get('/user/:id', function (req, res, next) {
    Entry.find()
      .where('user', req.params.id)
      .deepPopulate('tags pictures user.state user.profile') /* Retrieves data of linked schemas */
      .exec(function (err, entries) {
        if (err) {
          next(err);
        } else if (entries && entries.length) {
          res.send(entries);
        } else {
          res.status(400).end();
        }
      });
  });

};