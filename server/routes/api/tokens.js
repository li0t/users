'use strict';

var debug = require('debug')('app:api:tokens');

module.exports = function(router, mongoose) {

  var Token = mongoose.model('token');

  /**
   * Get Token by it's secret.
   *
   * @type Express Middleware.
   */
  router.get('/:secret', function(req, res, next) {

    Token.findOne().

    where('secret', req.params.secret).

    exec(function(err, token) {
      if (err) {
        if (err.name && (err.name === 'ValidationError' || err.name === 'CastError')) {
          res.sendStatus(400);
        } else {
          next(err);
        }
        return;
      }

      if (!token) {
        debug("Token %s was not found", req.params.secret);
        return res.sendStatus(404);
      }

      res.send(token);

    });

  });

};
