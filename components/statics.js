/* jshint node: true */
'use strict';
 
var debug = require('debug')('app:statics');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
 
module.exports = {
 
  models: [],
 
  model: function (model, slug) {
    return this.models[model][slug];
  },
 
  load: function statics(config, done) {
    var models = this.models,
        total = config.models.length,
        curr = 0,
        Model;
 
    config.models.forEach(function (model) {
      try {
        Model = mongoose.model(config.prefix + '.' + model);
 
        Model.find(function (err, results) {
          var ltotal = 0,
              lcurr = 0;
 
          curr++;
 
          if (err) {
            debug('Could not retrieve %s.%s!', config.prefix, model);
          } else if (results.length) {
            ltotal += results.length;
            models[model] = {};
 
            results.forEach(function (result) {
              lcurr++;
 
              models[model][result.slug] = result;
              debug('%s.%s.%s --> %s', config.prefix, model, result.slug, result._id);
            });
          } else {
            debug('There is no data for %s.%s!', config.prefix, model);
          }
 
          if (ltotal === lcurr) {
            if (curr === total) {
              done();
            }
          }
        });
      } catch (ex) {
        debug('Could not load %s.%s!', config.prefix, model);
      }
    });
  }
 
};