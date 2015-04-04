'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:mapControls
 * @description
 * # mapControls
 */
angular.module('challengeApp')
  .directive('mapControls', [ '$log', 'busService', function ($log, bus) {
    return {
      templateUrl: 'views/map-controls.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {
          // get the list of agencies
          bus.getAgencies();
          scope.agencies = bus.agencies;

          // widget controls
          scope.showAgencyData = function(tag) {
              $log.info(_.find(bus.agencies, function(d) { return d.tag === tag; }));
          }

      }
    };
  }]);
