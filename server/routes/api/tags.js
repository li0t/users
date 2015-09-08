'use strict';

//var debug = require('debug')('app:api:tags');

module.exports = function (router, mongoose) {

  var Tag = mongoose.model('tag');

  /**
   * Get all tags stored in the db
   */
  router.get('/', function(req, res, next){

    Tag.find().

    exec(function(err, tags) {
      if (err) {
        return next(err);
      }

        res.send(tags);

    });

  });

  /**
   * Get Tags by keywords
   */
  router.get('/like', function(req, res, next) {

    var keywords = req.query.keywords;
    var limit = req.query.limit;
    var skip = req.query.skip;

    var score = { score: { $meta: "textScore" }};
    var find = { $text: { $search: keywords }};

    Tag.find(find, score).

    sort('-_id').
    sort(score).

    skip(skip).
    limit(limit).

    populate('group').

    exec(function(err, tags) {
      if (err) {
        return next(err);
      }

      res.send(tags);

    });
  });

  /**
   * Create a new Tag
   */
  router.post('/', function(req, res, next){

    new Tag(req.body).

    save(function(err, tag) {
      if (err) {
        return next(err);
      }

        res.status(201).send(tag._id);

    });

  });

};
