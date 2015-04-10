/* jshint node: true */
'use strict';

module.exports = function (router, mongoose) {

  var Profile = mongoose.model('profile');

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
          metadata: req.body.metadata /* This should be several fields with the same name */
        })
      .exec(function (err) {
        if (err) {
          next(err);
        } else {
          res.redirect('api/users/' + req.sesion.user._id);
        }
      });
  });

  /**
   * Upload a picture
   */
  router.post('/picture', function (req, res, next) {
    var picture = {}; /* id returned by gridfs */

    Profile
      .findById(req.session.user.profile)
      .exec(function (err, profile) {
        if (err) {
          next(err);
        } else if (profile) {
          profile.picture.push = picture;
          profile.save(function (err) {
            if (err) {
              next(err);
            } else {
              res.redirect('/api/users/' + req.session.user._id);
            }
          });
        } else {
          res.status(400).end();
        }
      });
  });

};