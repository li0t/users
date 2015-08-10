'use strict';

module.exports = function(router /*, mongoose*/ ) {

  /**
   * Get current session's public data.
   */
  router.get('/session', function(req, res /*, next*/ ) {

    /* Check if there's a user in session */
    if (req.session.user) {
      var data = {
        user: {
          _id: req.session.user._id,
          email: req.session.user.email,
          group: req.session.user.group,
          /* "own" group */
          profile: {
            name: req.session.user.profile.name,
            gender: req.session.user.profile.gender && req.session.user.profile.gender.name,
            location: req.session.user.profile.location,
            birthdate: req.session.user.profile.birthdate
          }
        }
      };

      if (req.session.group) {
        data.group = {
          _id: req.session.group._id,
          profile : { name: req.session.group.profile.name },
          admin: {
            profile : { name: req.session.group.admin.profile.name },
          }
        };
      }

      res.send(data);
    } else {
      res.sendStatus(403);
    }
  });

};
