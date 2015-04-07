'use strict';

/**
 * @ngdoc service
 * @name challengeApp.renderingService
 * @description
 * # renderingService
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('renderingService', [ '$log', 'configuration', function ($log, conf) {

      // draw in the locations of the busses.
      function renderVehicleLocations(locations) {

          var p = d3.select('svg')
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
           .attr('r', '6')
           .attr('transform', function(d) { return 'translate(' + render.projection([d.lon, d.lat]) + ')'; })
           .style('fill', function(d) { return conf.colour(d.routeTag); });
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
            .append('path')
            .datum({ "type": "FeatureCollection", "features": features })
            .attr("class", "bus-routes path_route_" + tag)
            .attr("d", path)
            .style('stroke', '#FF7F0E');

      }

      // hide / show bus markers based on route selection if any...
      function toggleBusVisibility(selected) {
          if (_.isEmpty(selected)) {
              // no routes selected - ensure all buses visible
              d3.select('svg')
                .selectAll('circle')
                .style('visibility', 'visible');

          } else {
              // routes selected - show only those buses
              d3.select('svg')
                .selectAll('circle')
                .style('visibility', function(d) { 
                    return selected.indexOf(d.routeTag) === -1 ? 'hidden' : 'visible'; 
                });
          }
      }

      var render = {
          renderVehicleLocations: renderVehicleLocations,
          renderPaths: renderPaths,
          toggleBusVisibility: toggleBusVisibility,
      }
      return render;
  }]);
