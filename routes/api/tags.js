/* jshint node: true */

'use strict';

//var debug = require('debug')('app:api:tags');



module.exports = function (router, mongoose) { /** TODO: Validate if user is active*/

  var Tag = mongoose.model('tag');

  /**
   * Get all tags stored in the db
   */
  router.get('/', function(req, res, next){

    Tag.
    find().
    exec(function(err, tags) {

      if (err) {
        next(err);
      } else {
        res.send(tags);
      }
    });

  });

};