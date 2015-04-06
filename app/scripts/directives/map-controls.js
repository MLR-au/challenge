'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:mapControls
 * @description
 * # mapControls
 */
angular.module('challengeApp')
  .directive('mapControls', [ '$log', '$window', '$timeout', 'busService', function ($log, $window, $timeout, bus) {
    return {
      templateUrl: 'views/map-controls.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {
          // size the control to window height
          scope.mapControlStyle = {
              'position': 'relative',
              'height': $window.innerHeight - 5,
              'overflow': 'auto',
              'border-radius': '4px'
          }


          // listen for the signal notifying us that the maps are drawn
          //  and kick off the rendering
          scope.$on('all-map-layers-drawn', function() {
              // get the list of routes - and consequently, the
              //  list of bus locations.
              scope.routes = bus.routes;
              bus.getRoutes();

              // and kick off the update sequence
              $timeout(function() {
                  scope.update();
              }, 15000);
          });

          scope.update = function() {
              bus.getVehicleLocations();
              $timeout(function() {
                  scope.update();
              }, 15000);
          }
          
          // widget controls
          //scope.showAgencyData = function(tag) {
          //    $log.info(_.find(bus.agencies, function(d) { return d.tag === tag; }));
          //}

      }
    };
  }]);
