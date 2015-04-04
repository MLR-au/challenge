'use strict';

/**
 * @ngdoc function
 * @name challengeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the challengeApp
 */
angular.module('challengeApp')
  .controller('MainCtrl', [ '$scope', '$window', '$log', function ($scope, $window, $log) {

      var width = $window.innerWidth,
          height = $window.innerHeight;

      // we'll pass the scale and transform from the neighborhood
      //  render back via this object
      $scope.translate = {};

      // define the dimensions of the svg; the layers need this to compute
      //  the center
      $scope.dimensions = { 'width': width, 'height': height }

      // the layers we want drawn over the top
      $scope.layers = [ 'streets', 'arteries', 'freeways' ];
  }]);
