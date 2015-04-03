'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:renderLayer
 * @description
 * # renderLayer
 */
angular.module('challengeApp')
  .directive('renderLayer', [ '$log', function ($log) {
    return {
      template: '',
      restrict: 'E',
      scope: {
        layers: '=',
        translate: '='
      },
      link: function postLink(scope, element, attrs) {

          // Assuming the layers come in in the order we want them; we draw
          //  one layer at a time called the draw method when the current is done

          var drawLayer = function(layer) {
              var layerData = '/data/topojson/' + layer + '.json';
              d3.json(layerData, function(error, data) {
                  if (error) return $log.error(data);
                  //$log.info(data);

                  var features = topojson.feature(data, data.objects[layer]);
                  $log.info(features);
                  var projection = d3.geo.albers()
                                     .scale(1)
                                     .translate([0,0]);

                  var path = d3.geo.path().projection(projection);

                  projection.scale(scope.translate.scale).translate(scope.translate.transform);

                  d3.select('svg')
                    .selectAll('.' + layer)
                    .data(features.features)
                    .enter()
                    .append('path')
                    .attr('class', layer)
                    .attr('d', path);

                  // draw the next layer
                  if (scope.layers.length > 0) drawLayer(scope.layers.shift());
              })
          }

          // kick off the drawing
          drawLayer(scope.layers.shift());
      }
    };
  }]);
