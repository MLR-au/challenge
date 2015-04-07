'use strict';

/**
 * @ngdoc directive
 * @name challengeApp.directive:renderMap
 * @description
 * # renderMap
 */
angular.module('challengeApp')
  .directive('renderMap', [ '$window', '$log', 'maps', 'configuration', 
        function ($window, $log, maps, conf) {
    return {
      templateUrl: 'views/render-map.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {

          // show the loading indicator
          scope.loading = true;

          // determine the size of the svg
          //  It should be as wide as the parent and as tall as the window
          var width = element[0].offsetParent.clientWidth - 30,
              height = $window.innerHeight;
          //$log.debug('SVG dimensions', width, height);

          // and draw it in
          d3.select('#map')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
          $log.info('SVG appended to div.');

          // the available layers - these are in the order we want them retrieved
          maps.get(conf.layers);

          // render the layers upong receiving the signal that all the 
          //  required data has been retrieved.
          scope.$on('render-maps', function() {
              scope.dimensions = {
                  'width': width,
                  'height': height
              }

              // go ahead and render the layers then...
              scope.loading = false;
              scope.renderLayers = true;

          });
      }
    };
  }]);
