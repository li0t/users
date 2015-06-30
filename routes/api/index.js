/* jshint node: true */
/* global schema */
'use strict';

module.exports = function (router, mongoose) {

    /**
     * Get current session's public data.
     */
    router.get('/session', function (req, res, next) {

        /* Check if there's a user in session */
        if (req.session.user) {
            res.send({
                user: {
                    _id: req.session.user._id,
                    email: req.session.user.email,
                    profile: {
                      name: req.session.user.profile.name,
                      gender: req.session.user.profile.gender || req.session.user.profile.gender.name,
                      location: req.session.user.profile.location,
                      birthdate: req.session.user.profile.birthdate
                    }
                }
            });
        } else {
            res.status(401).end();
        }

    });

};
