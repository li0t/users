/* jshint browser: true */
/* global angular */

(function (ng, window) {
  'use strict';

  var serverDiff = 0;

  ng.module('Moment', []).factory('$moment', function () {

    window.moment.locale('es');
    window.moment.locale('es', {
      longDateFormat: {
        LT: "HH:mm",
        l: "D-M-YYYY",
        L: "DD-MM-YYYY",
        LTS: "HH:mm:ss",
      }
    });

    window.moment.setServerDiff = function (diff) {
      serverDiff = diff;
    };

    return window.moment;

  }).filter('fromNow', [
    '$moment',

    function ($moment) {
      return function (date, strip) {
        return $moment(date).from(Date.now() - serverDiff, strip);
      };
    }

  ]).filter('calendar', [
    '$moment',

    function ($moment) {
      return function (date) {
        return $moment(date).calendar();
      };
    }

  ]).filter('toLocal', [
    '$moment',

    function ($moment) {
      return function (date) {
        return $moment(date).format('L LT');
      };
    }

  ]).filter('age', [
    '$moment',

    function ($moment) {
      return function (bdate) {
        return $moment().from(bdate, true);
      };
    }
  ]);

}(angular, window));
