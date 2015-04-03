'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:renderNeighborhoods
 * @description
 * # renderNeighborhoods
 */
angular.module('challengeApp')
  .directive('renderNeighborhoods', [ '$log', function ($log) {
    return {
      template: '',
      restrict: 'E',
      scope: {
          dimensions: '=',
          translate: '='
      },
      link: function postLink(scope, element, attrs) {

          // Why is this a standalone directive?
          //  Basically, we load this guy up and figure out the scale and transform based on
          //  it. Then, we use that same scale and transform against the other layers

          // get the layer data
          var layerData = '/data/topojson/neighborhoods.json';
          d3.json(layerData, function(error, data) {
              if (error) return $log.error(data);
              //$log.info(data);

              var neighborhoods = topojson.feature(data, data.objects.neighborhoods);
              //$log.info(neighborhoods);
              var projection = d3.geo.albers()
                                 .scale(1)
                                 .translate([0,0]);

              var path = d3.geo.path().projection(projection);

              var b = path.bounds(neighborhoods),
                  s = .95 / Math.max((b[1][0] - b[0][0]) / scope.dimensions.width, (b[1][1] - b[0][1]) / scope.dimensions.height),
                  t = [(scope.dimensions.width - s * (b[1][0] + b[0][0])) / 2, (scope.dimensions.height - s * (b[1][1] + b[0][1])) / 2];

              // the controller needs this info so it can pass it in to the other layers
              scope.translate.scale = s;
              scope.translate.transform = t;

              // scale and translate the projection
              projection.scale(s).translate(t);

              d3.select('svg')
                .selectAll('.neighborhoods')
                .data(neighborhoods.features)
                .enter()
                .append('path')
                .attr('class', 'neighborhoods')
                .attr('d', path);

              // pub up the chain to kick of the rendering of the other layers
              scope.$emit('render-other-layers');
          })

      }
    };
  }]);
