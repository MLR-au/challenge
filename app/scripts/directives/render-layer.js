'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:renderLayer
 * @description
 * # renderLayer
 *
 * Resources: http://bost.ocks.org/mike/map/
 *            https://github.com/mbostock/d3/wiki/Geo-Projections
 *            http://stackoverflow.com/a/14691788
 */
angular.module('challengeApp')
  .directive('renderLayer', [ '$rootScope', '$log', 'maps', 'renderingService', 
        function ($rootScope, $log, maps, render) {
    return {
      template: '',
      restrict: 'E',
      scope: {
        dimensions: '='
      },
      link: function postLink(scope, element, attrs) {
          // get the map layers from the maps service
          // assume they're in the order in which they should be rendered
          // use the first to define the scale and transform for the set
          // then just iterate over the lot drawing them in one at a time
          //
          scope.layers = maps.mapData;
          //$log.debug(scope.layers);

          // i think the name gives it away, this determines the transform to be applied
          //  and we'll base the transform on the map itself so it scale to 95% and translates
          //  to the right place. And credit where it's due:
          //  http://stackoverflow.com/a/14691788
          var calculateTransform = function(path, features) {
              var b = path.bounds(features),
                  s = .95 / Math.max((b[1][0] - b[0][0]) / scope.dimensions.width, (b[1][1] - b[0][1]) / scope.dimensions.height),
                  t = [(scope.dimensions.width - s * (b[1][0] + b[0][0])) / 2, (scope.dimensions.height - s * (b[1][1] + b[0][1])) / 2];

              // the transform to be applied to the set
              scope.transform = {
                  scale: s,
                  translate: t
              }
              
          }
          
          var drawLayer = function(layer, which) {
              $log.info('Drawing: ', layer.name);

              // extract the features we want to draw
              var features = topojson.feature(layer.data, layer.data.objects[layer.name]);
              //$log.debug(features);

              // create a projection
              var projection = d3.geo.mercator()
                                 .scale(1)
                                 .translate([0,0]);

              // create a path
              var path = d3.geo.path().projection(projection);

              // on the first run - calculate the transform
              if (which === 'first') calculateTransform(path, features);

              // transform the projection
              projection.scale(scope.transform.scale).translate(scope.transform.translate);

              // and stash the transformed projection in the render service because we'll need it 
              //  to draw the vehicle locations on the map
              render.projection = projection;

              // draw the layer
              d3.select('svg')
                .select('g')
                .selectAll('.' + layer.name)
                .data(features.features)
                .enter()
                .append('path')
                .attr('class', layer.name)
                .attr('d', path);

              // next
              if (!_.isEmpty(scope.layers)) {
                  drawLayer(scope.layers.shift());
              } else {
                  // when the layers array is empty all maps have been drawn
                  $rootScope.$broadcast('all-map-layers-drawn');
              }
          }

          // kick off the drawing
          drawLayer(scope.layers.shift(), 'first');
      }
    };
  }]);
