'use strict';

var fileman = component('fileman');
var gridfs = component('gridfs');

module.exports = function (router) {

  /**
   * Obtain a file.
   *
   * @type Express Middleware.
   */
  router.get('/:id/:name?', function (req, res, next) {

    /* Get the file from GridFS */
    gridfs.get(req.params.id, function (err, fsfile, stream) {

      if (err) {
        next(err);
      } else if (fsfile) {
        res.set('Content-Type', fsfile.contentType);
        stream.pipe(res);
      } else {
        res.sendStatus(404);
      }

    });

  });

  /**
   * Upload a file.
   *
   * @type Express Middleware.
   */
  router.post('/', function (req, res, next) {

    var result;
    var curr = 0;

    function validated(err, file) {
      curr += 1;

      if (err) {
        next(err);
      } else {
        var stream = gridfs.save(file.data, {
          content_type: file.mimetype,
          filename: file.filename
        });

        stream.on('close', function () {
          if (curr === req.files.length) {
            res.end();
          }
        });

        stream.on('error', function (err) {
          next(err);
        });
      }
    }

    if (req.files.length) {
      req.files.forEach(function (file) {
        result = fileman.validate(file, validated);
      });
    } else {
      res.sendStatus(400);
    }

  });

};
