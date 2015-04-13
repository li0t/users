/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt'),
    _ = require('underscore');

module.exports = function (router, mongoose) {

    var Contact = mongoose.model('user'),
        User = mongoose.model('user');

    /** Add contact request */
    router.get('/addContact/:id', function (req, res, next) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                next(err);
            } else if (user) {
                /*TODO*/
            } else {
                res.status(400).end();
            }
        });
    });

};