'use strict';

module.exports = function(router, mongoose) {

  var User = mongoose.model('user');

  /**
   * Get current session's public data.
   */
  router.get('/session', function(req, res /*, next*/ ) {

    /* Check if there's a user in session */
    if (req.session.user) {
      var data = {
        user: {
          /* "own" group */
          group: req.session.user.group,
          email: req.session.user.email,
          _id: req.session.user._id,
          profile: {
            gender: req.session.user.profile.gender && req.session.user.profile.gender.name,
            birthdate: req.session.user.profile.birthdate,
            location: req.session.user.profile.location,
            pictures: req.session.user.profile.pictures,
            name: req.session.user.profile.name
          }
        }
      };

      if (req.session.group) {
        data.group = {
          profile: {
            name: req.session.group.profile.name
          },
          _id: req.session.group._id,
          admin: {
            profile: {
              name: req.session.group.admin.profile.name
            },
            _id: req.session.group.admin._id
          }
        };
      }

      res.send(data);
    } else {
      res.sendStatus(403);
    }
  });

  /**
   * Get current session's public data.
   */
  router.get('/session/pictures', function(req, res, next) {

    /* Check if there's a user in session */
    if (!req.session.user) {
      return res.sendStatus(403);
    }

    User.findById(req.session.user._id).

    populate('profile').

    exec(function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user || !user.profile || !user.profile.pictures) {
        return res.sendStatus(400);
      }

      var pictures = user.profile.pictures;

      req.session.user.profile.pictures = pictures;

      res.send(pictures);

    });
  });

};
