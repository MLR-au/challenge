'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:renderLayer
 * @description
 * # renderLayer
 */
angular.module('challengeApp')
  .directive('renderLayer', [ '$log', '$window', function ($log, $window) {
    return {
      templateUrl: 'views/render-layer.html',
      restrict: 'E',
      scope: {
        layers: '='
      },
      link: function postLink(scope, element, attrs) {
          var width = $window.innerWidth,
              height = $window.innerHeight;

          // draw the svg
          var svg = d3.select('#layer')
                      .append('svg')
                      .attr('width', width)
                      .attr('height', height);

          var d = '/data/topojson/neighborhoods.json';


          d3.json(d, function(error, data) {
              if (error) return $log.error(data);
              //$log.info(data);

              var neighborhoods = topojson.feature(data, data.objects.neighborhoods);
              var neighborhood = neighborhoods.features.filter(function(d) { return d.properties.neighborho === 'Twin Peaks'; });
              $log.info(neighborhoods);
              $log.info(neighborhood);

              var projection = d3.geo.albers()
                                 .scale(1)
                                 .translate([0,0]);

              var path = d3.geo.path().projection(projection);

              var b = path.bounds(neighborhoods),
                  s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                  t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

              projection.scale(s).translate(t);

              svg.append('path')
                 .datum(neighborhoods)
                 .attr('class', 'path')
                 .attr('d', path);
          })
      }
    };
  }]);
