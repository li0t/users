/* jshint node: true */
/* global component */
'use strict';

module.exports = function (router, mongoose) {

    var Entry = mongoose.model('entry'),
        Tag = mongoose.model('tag'),
        debug = require('debug')('app:api:entries');

    var gridfs = component('gridfs');

    /**
     * Creates a new entry
     * SEPARATE FILES UPLOAD IN SEPARATED REQUEST
     * STORE TAGS AS STRING
     */
    router.post('/create', function (req, res, next) {
        var entry, /* This is the target schema */
            tagsSaved = 0;

        /**
         * Save the document
         */
        function saveEntry() {
            entry.save(function (err, entry) {
                if (err) {
                    next(err);
                } else {
                    entry.deepPopulate('user.contacts user.state user.profile', function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(201).send(entry);
                        }
                    });
                }
            });
        }

        /** 
         * Looksup for tags provided by the user
         * if one is not found creates a new tag and stores the id
         */
        function saveTags() {
            /* Check if all tags were found and/or created*/
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
                Tag.find()
                    .where('name', tag)
                    .exec(function (err, found) {
                        if (err) {
                            console.log(err);
                        } else if (found && found.length) {
                            console.log('Tag found : ' + found);
                            onTagReady(found[0]);
                        } else {
                            console.log('Creating new Tag : ' + tag);
                            new Tag({
                                name: tag
                            }).save(function (err, newTag) {
                                if (err) {
                                    debug(err);
                                } else {
                                    onTagReady(newTag);
                                }
                            });
                        }
                    });
            });
        }

        new Entry({
            user: req.session.user._id,
            title: req.body.title,
            content: req.body.content /* Markdown text */ ,
        }).save(function (err, data) {
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

    });

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
                    entry.deepPopulate('pictures user.contacts user.state user.profile', function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(201).send(entry);
                        }
                    });
                }
            });
        }

        /**
         * Save pictures with gridfs and store de ids
         */
        function savePictures() {
            function onclose(fsFile) {
                debug('Saved %s file with id %s', fsFile.filename, fsFile._id);

                entry.pictures.push(fsFile._id); /* Add the picture's id to the entry.pictures array */

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

        Entry.find()
            .where('_id', req.params.id)
            .where('user', req.session.user._id)
            .exec(function (err, data) {
                if (err) {
                    next(err);
                } else if (data) {
                    entry = data[0];
                    if (req.files && req.files.length) { /* If there are any files, save them */
                        savePictures();
                    } else { /* If not, just save the document */
                        saveEntry();
                    }
                } else {
                    res.status(404).end();
                }
            });
    });

    /**
     * Get entries base on tags 
     + Only works for a perfect match
     */
    router.get('/tags', function (req, res, next) { /* NOT WORKING */

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
    router.get('/tags/any', function (req, res, next) { /* NOT WORKING */
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
            .deepPopulate('tags pictures user.state user.profile') /* Retrieves data from linked schemas */
            .exec(function (err, entry) {
                if (err) {
                    next(err);
                } else if (entry) {
                    res.send(entry);
                } else {
                    res.status(404).end();
                }
            });
    });

    /**
     * Get entries of an user
     */
    router.get('/user/:id', function (req, res, next) {
        Entry.find()
            .where('user', req.params.id)
            .deepPopulate('tags pictures user.state user.profile') /* Retrieves data from linked schemas */
            .exec(function (err, entries) {
                if (err) {
                    next(err);
                } else if (entries && entries.length) {
                    res.send(entries);
                } else {
                    res.status(404).end();
                }
            });
    });

};