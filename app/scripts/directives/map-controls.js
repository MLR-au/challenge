'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:mapControls
 * @description
 * # mapControls
 */
angular.module('challengeApp')
  .directive('mapControls', [ '$log', '$window', 'busService', function ($log, $window, bus) {
    return {
      templateUrl: 'views/map-controls.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {

          // size the control to window height
          scope.mapControlStyle = {
              'position': 'relative',
              'height': $window.innerHeight,
              'overflow': 'auto'
          }

          // get the list of routes
          bus.getRoutes();

          // and bind the result in to this scope
          scope.routes = bus.routes;

          // widget controls
          //scope.showAgencyData = function(tag) {
          //    $log.info(_.find(bus.agencies, function(d) { return d.tag === tag; }));
          //}

      }
    };
  }]);
