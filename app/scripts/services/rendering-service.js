'use strict';

/**
 * @ngdoc service
 * @name challengeApp.renderingService
 * @description
 * # renderingService
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('renderingService', [ '$rootScope', '$log', 'configuration', function ($rootScope, $log, conf) {

      // draw in the locations of the busses.
      function renderVehicleLocations(locations) {

          var p = d3.select('svg')
                    .select('g')
                    .selectAll('circle')
                    .data(locations); 

          // transition existing markers
          p.transition()
           .duration(1000)
           .attr('transform', function(d) { return 'translate(' + render.projection([d.lon, d.lat]) + ')'; });

          // draw in new location markers
          p.enter()
           .append('circle')
           .attr('class', function(d) { 
               return 'circle bus_route_' + d.routeTag;
           })
           .attr('r', function(d) {
                if (_.isEmpty(render.selected)) {
                    return '6';
                } else {
                    return '10';
                }
           })
           .attr('transform', function(d) { return 'translate(' + render.projection([d.lon, d.lat]) + ')'; })
           .style('fill', function(d) { 
                if (_.isEmpty(render.selected)) {
                    return conf.colour(d.routeTag);
                }
           })
           .style('visibility', function(d) { 
                if (_.isEmpty(render.selected)) {
                    return 'visible';
                } else {
                    return render.selected.indexOf(d.routeTag) === -1 ? 'hidden' : 'visible'; 
                }
           })
           .on('click', function(d) {
               $rootScope.$apply(function() {
                   render.busesClicked.push(d.routeTag); 
                   $rootScope.$broadcast('toggle-route');
               });
           });
      }

      // render in the bus paths
      function renderPaths(tag, paths) {
          //$log.debug('S:rendering-service; renderPaths; paths', paths);
 
          // pick up a path generator
          var path = d3.geo.path().projection(render.projection);
          
          // create the geojson features object
          var features = [{
              "type": "Feature",
              "geometry": {
                  "type": "MultiLineString",
                  "coordinates": paths
              }
          }]

          // let d3 do the rest...
          d3.select('svg')
            .select('g')
            .append('path')
            .datum({ "type": "FeatureCollection", "features": features })
            .attr("class", "bus-routes path_route_" + tag)
            .attr("d", path)
            .style('stroke', '#FF7F0E');
      }

      // hide / show bus markers based on route selection if any...
      function toggleBusVisibility(selected, locations) {
          // save selected into this service so when the next update
          //  happens, we can use it to set new nodes visible or not
          render.selected = selected;

          // remove all nodes
          d3.select('svg')
            .selectAll('circle')
            .remove();

          // trigger re-render - visibility handled as part of that process
          render.renderVehicleLocations(locations);

      }

      var render = {
          selected: [],
          busesClicked: [],
          renderVehicleLocations: renderVehicleLocations,
          renderPaths: renderPaths,
          toggleBusVisibility: toggleBusVisibility,
      }
      return render;
  }]);
