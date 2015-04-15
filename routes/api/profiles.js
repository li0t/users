/* jshint node: true */
/* global component */
'use strict';

module.exports = function (router, mongoose) {

    var Profile = mongoose.model('profile'),
        User = mongoose.model('user'),
        debug = require('debug');

    var gridfs = component('gridfs');



    /** 
     * Update Profile linked to User
     */
    router.post('/', function (req, res, next) {
        Profile
            .findOneAndUpdate({
                    _id: req.session.user.profile
                },
                /* Assuming that the data of each field will be pre-filled */
                {
                    name: req.body.name,
                    birthdate: req.body.birthdate,
                    gender: req.body.gender,
                    location: req.body.location,
                })
            .exec(function (err) {
                if (err) {
                    /* Check for duplicated entry */
                    if (err.code && err.code === 11000) {
                        res.status(409).end();
                    } else if (err.name && err.name === 'ValidationError') {
                        res.status(400).end();
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect('/api/users/' + req.session.user._id);
                }
            });
    });

    /**
     * Upload a picture
     */
    router.post('/pictures', function (req, res, next) {

        var profile, /* This is the target schema */
            saved = 0;

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
                    console.log('All files saved');
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

        Profile.findById(req.session.user.profile, function (err, data) {
            if (err) {
                next(err);
            } else if (data) {
                profile = data;
                if (req.files && req.files.length) { /* If there are any files, save them */
                    savePictures();
                } else { /* If not, just save the profile */
                    debug('no files saved');
                    saveProfile();
                }
            } else {
                res.status(400).end();
            }
        });

    });


    /** 
     * Get all the profiles pictures of one user
     */
    router.get('/:id/pictures', function (req, res, next) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                next(err);
            } else if (user) {
                Profile.find()
                    .where('_id', user.profile)
                    .populate('pictures')
                    .exec(function (err, profile) {
                        if (err) {
                            next(err);
                        } else if (profile && profile[0].pictures.length) {
                            res.send(profile[0].pictures);
                        } else {
                            debug('No pictures found for id %s', user.profile);
                            res.status(404).end();
                        }
                    });
            } else {
                debug('No user found for id %s', req.params.id);
                res.status(404).end();
            }
        });

    });

};