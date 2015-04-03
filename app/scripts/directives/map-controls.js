'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:mapControls
 * @description
 * # mapControls
 */
angular.module('challengeApp')
  .directive('mapControls', [ '$log', function ($log) {
    return {
      templateUrl: 'views/map-controls.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
