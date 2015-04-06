'use strict';

/**
 * @ngdoc service
 * @name challengeApp.busService
 * @description
 * # busService
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('busService', [ '$rootScope', '$log', '$resource', 'maps', 'configuration', 
        function ($rootScope, $log, $resource, maps, conf) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    //
      
      // helper to minimise the number of times I need to write
      //  getAttribute to..... 1
      function get(o, attributeList, optionalMap) {
          var d = {};
          angular.forEach(attributeList, function(v,k) {
              d[v] = o.getAttribute(v);
          })

          // this will be an object keyed on the attributes attributeList
          //  with the corresponding value extracted from the node
          return _.extend(d, optionalMap);
      }

      // get the list of agencies
      function getRoutes() {
          // go on and get the routes
          var routes = bus.resource.get({ 'command': 'routeList' }, function() {

              // construct the array of routes;
              _.each(routes.nodes, function(d) { bus.routes.push(get(d, ['tag', 'title'], { 'selected': true })); });

              // to make things easier when getting the locations, extract the tags
              //  out into an array
              bus.routeTags = _.pluck(bus.routes, 'tag');

              //
              $log.debug('S:bus-service; getRoutes; routes', bus.routes);
              //$log.debug('S:bus-service; getRoutes; routeTags', bus.routeTags);

              // now that we have the routes we can get the vehicle locations
              bus.getVehicleLocations();
          });
      }

      // get the list of vehicle locations for each route
      function getVehicleLocations() {
          // a place to stash our new locations until we have them all 
          //  and update the data bound list
          var newLocations = {}; 

          // our download q - when it's empty; we've retrieved all the data we need
          var q = [];

          // get the locations for all vehicles on all routes
          angular.forEach(bus.routeTags, function(v,k) {
              var routeTag = v;

              // we need to know when all the data has been retrieved and since it's asynchronous
              //  we'll use a queue into which we push and later splice route tags as we retrieve / receive the data
              q.push(routeTag);

              // get the route last time or set to 0 if the first run
              var since = bus.routeLocationsLastTime[routeTag] === undefined ? '0': bus.routeLocationsLastTime[routeTag].time;
              //$log.debug('S:bus-service, getVehicleLocations; since', routeTag, since);

              var locations = bus.resource.get({ 'command': 'vehicleLocations', 'r': routeTag, 't': '0' }, function() {
                  // construct the map of locations for this route
                  var l = _.each(locations.nodes, function(d) { 
                      if (d.localName === 'vehicle') {
                          var d = get(d, ['id', 'routeTag', 'dirTag', 'lat', 'lon', 'secsSinceReport']); 
                          newLocations[d.routeTag + d.id] = d;
                      } else if (d.localName === 'lastTime') {
                          bus.routeLocationsLastTime[routeTag] = get(d, ['time']);
                      }
                  });
                  
                  // remove this tag from the q
                  q.splice(q.indexOf(routeTag), 1);

                  // we have all of the data - update!
                  if (_.isEmpty(q)) {
                      //$log.debug('S:bus-service; getVehicleLocations; bus.locations', bus.locations);
                      //$log.debug('S:bus-service; getVehicleLocations; bus.locations', bus.routeLocationsLastTime);
                      updateVehicleData(newLocations);
                  }
              });
          });
      }

      function updateVehicleData(newLocations) {
          $log.info('Updating vehicle locations');

          // update the data for busses being tracked
          angular.forEach(bus.locations, function(v,k) {
              if (newLocations[v.routeTag + v.id] !== undefined) {
                  var i = v.routeTag + v.id;
                  bus.locations[k] = newLocations[i];
                  delete newLocations[i];
              }
          });

          // add in any new data
          //$log.debug('S:bus-service; updateVehicleData, new data', newLocations);
          angular.forEach(newLocations, function(v,k) {
              bus.locations.push(v);
          })

          // update map
          //$log.debug('S:bus-service; updateVehicleData, bus.locations', bus.locations);
          renderVehicleLocations();
      }

      function toggleRoute(tag) {
          if (bus.selectedRoutes.indexOf(tag) === -1) {
              // not currently selected so add it
              bus.selectedRoutes.push(tag);
          } else {
              // currently selected so remove it
              bus.selectedRoutes.splice(bus.selectedRoutes.indexOf(tag), 1);
          }

          angular.forEach(bus.routes, function(v,k) {
              // mark those that are selected
              if (!_.isEmpty(bus.selectedRoutes)) {
                  bus.routes[k].selected = bus.selectedRoutes.indexOf(v.tag) === -1 ? false : true;
              } else {
                  bus.routes[k].selected = true;
              }

          })
      }

      // draw in the locations of the busses.
      function renderVehicleLocations() {
          var color = d3.scale.category20();

          // transition existing markers
          d3.select('svg')
            .selectAll('circle')
            .data(bus.locations)
            .transition()
            .duration(1000)
            .attr('transform', function(d) { return 'translate(' + bus.projection([d.lon, d.lat]) + ')'; });

          // draw in new location markers
          d3.select('svg')
            .selectAll('circle')
            .data(bus.locations)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('r', '6')
            .attr('transform', function(d) { return 'translate(' + bus.projection([d.lon, d.lat]) + ')'; })
            .style('fill', function(d) { return color(d.routeTag); });
      }

      var bus = {
          // instance variables
          routes: [],
          routeTags: [],
          locations: [],
          routeLocationsLastTime: {},
          selectedRoutes: [],

          // ng-resource: resource service
          resource: $resource('http://webservices.nextbus.com/service/publicXMLFeed?command=:command&a=sf-muni', {}, {
              get: { 
                  command: '@command',
                  transformResponse: function(d) {
                      var parser = new DOMParser();
                      var xmldoc = parser.parseFromString(d, "text/xml");
                      var nodes = _.reject(xmldoc.documentElement.childNodes, function(n) { return n.nodeType === Node.TEXT_NODE; });

                      return { 'nodes': nodes };
                  }
              },
          }),

          // methods
          getRoutes: getRoutes,
          getVehicleLocations: getVehicleLocations,
          toggleRoute: toggleRoute,
      }
      return bus;
  }]);
