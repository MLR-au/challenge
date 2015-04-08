'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:mapControls
 * @description
 * # mapControls
 */
angular.module('challengeApp')
  .directive('mapControls', [ '$log', '$window', '$timeout', 'busService', 'renderingService',
        function ($log, $window, $timeout, bus, render) {
    return {
      templateUrl: 'views/map-controls.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {
          // init
          scope.busInformation = {};

          // to start with: show routes tab, hide bus info
          scope.status = {
              'routes': true,
              'busInformation': false,
          }

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
          scope.selectRoute = function(tag) {
              //$log.debug('D:map-controls; selectRoute, selected', tag);
              bus.toggleRoute(tag);

          }

/*
          scope.zoomToStop = function(stopId, coords) {
              var x, y, k, centered;
              var feature = {
                  "type": "Feature",
                  "geometry": {
                      "coordinates": coords,
                      "type": "Point"
                  }
              }

              var path = d3.geo.path().projection(render.projection);
              var centroid = path.centroid(feature);
              if (scope.stopId !== stopId) {
                  var x = centroid[0],
                      y = centroid[1],
                      k = 2;
                  scope.stopId = stopId;

                  d3.select('svg')
                    .select('g')
                    .transition()
                    .duration(750)
                    .attr("transform", "scale(" + k + ") translate(" + -x + "," + -y + ")");

              } else {
                  scope.stopId = null;

                  d3.select('svg')
                    .select('g')
                    .transition()
                    .duration(750)
                    .attr("transform", "");
              }

          }
*/

          scope.selectedRoutes = bus.selectedRoutes;
          scope.$watch('selectedRoutes', function(n,o) {
              if (_.isEmpty(scope.selectedRoutes)) {
                  // nothing selected - show routes panel
                  scope.status.routes = true;
                  scope.status.busInformation = false;
                  scope.busInformation = {};
              } else {
                  // route(s) selected - show route information
                  scope.status.routes = false;
                  scope.status.busInformation = true;
                  scope.busInformation = {};
                  _.each(scope.selectedRoutes, function(d) { 
                      scope.busInformation[d] = bus.routes[d]; 
                  });
              }
          }, true);

      }
    };
  }]);
