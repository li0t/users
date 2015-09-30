/**
 * Service oriented to provide general purpose utils such as sorting methods.
 *
 * @type AngularJS Service.
 */
(function(ng) {
  'use strict';

  ng.module('App').factory('$utils', function() {

    var attribute;

    /**
     * Validate the sort parameters before sorting.
     *
     * @param {Object} array The array to be sorted.
     * @param {String} _attribute The attribute of the objects
     * in the array which will be compared inside quicksort.
     * It can represent a numeric or date value of the object.
     *
     * @return {Object} array The sorted array.
     **/
    function quicksortValidator(array, _attribute) {

      try {

        attribute = _attribute;

        if (!Array.isArray(array)) {
          throw new Error(array + ' is not an array');
        }

        if (!array.length) {
          throw new Error('The array is empty');
        }

        if (!attribute) {
          throw new Error('You must pass in a sort attribute');
        }

        if (!array[0].hasOwnProperty(attribute)) {
          throw new Error(attribute + ' is not an attribute of ' + array);
        }

        /** Is number or date **/
        if (isNaN(array[0][attribute]) && isNaN(new Date(array[0][attribute]))) {
          throw new Error('Attribute ' + attribute + ', isNaN');
        }

        if (array.length > 1) {
          array = quicksort(array);
        }

      } catch (err) {
        console.error(err);
        array = null;
      } finally {
        return array;
      }

    }

    /**
     * Quicksort implementation.
     *
     * @param {Object} array The array to be sorted.
     * @param {Number} left The left index of the array.
     * @param {Number} right The right index of the array.
     *
     * @return {Object} array The sorted array.
     **/
    function quicksort(array, left, right) {

      var index;

      left = (typeof left === 'number') ? left : 0;
      right = (typeof right === 'number') ? right : array.length - 1;

      index = partition(array, left, right);

      if (left < index - 1) {
        quicksort(array, left, index - 1);
      }

      if (right > index) {
        quicksort(array, index, right);
      }

      return array;
    }

    /**
     * Utility method of quicksort.
     * Select a mean pivot and put all items with higher attribute value
     * by the left side of the pivot and all items with lower attribute value
     * by the right side of the pivot.
     *
     * @param {Object} array The array to be sorted.
     * @param {Number} left The left index of the array.
     * @param {Number} right The right index of the array.
     *
     * @return {Number} left The left index of the array.
     **/
    function partition(array, left, right) {

      var pivot = array[Math.floor((right + left) / 2)];

      while (left <= right) {

        while (array[left][attribute] > pivot[attribute]) {
          left++;
        }

        while (array[right][attribute] < pivot[attribute]) {
          right--;
        }

        if (left <= right) {
          swap(array, left, right);
          left++;
          right--;
        }
      }

      return left;
    }

    /**
     * Utility method of quicksort.
     * Swap left and right items positions.
     *
     * @param {Object} array The array object.
     * @param {Number} left The left index of the array.
     * @param {Number} right The right index of the array.
     *
     * @return {Number} left The left index of the array.
     **/
    function swap(array, left, right) {
      var temp = array[left];
      array[left] = array[right];
      array[right] = temp;
    }

    return {
      quicksort: quicksortValidator
    };

  });

}(angular));
