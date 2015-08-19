/* jshint browser: true */
/*global angular */

(function (ng) {
  'use strict';

  ng.module('App').factory('$emCard', function () {

    return {

      activeCard: false,
      showDetails: false,

      setCard: function (card) {
        if(card != null){
          this.activeCard = card;
        }

        return false;
      },

      getCard: function () {
        return this.activeCard;
      },

      showDetailsBar: function (bool) {
        this.showDetails = bool;
      }
    };

  });

}(angular));
