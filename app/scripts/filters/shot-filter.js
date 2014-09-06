'use strict';

/**
 * Takes in an integer and returns a 4 digit zero-padded shot string.
 * e.g. 1 => '0001', 214 => '0214', 9999 => '9999'
 * @param {number} num to convert.
 * @return {string} 0-padded 4 digit string shot number.
 */
function ShotFilter(num) {
  return ('0000' + num).slice(-4);
}

angular
  .module('shotbyshot')
  .filter('shot', function() {
    return ShotFilter;
  });
