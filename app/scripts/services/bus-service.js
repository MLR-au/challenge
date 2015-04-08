'use strict';

/**
 * @ngdoc service
 * @name challengeApp.busService
 * @description
 * # busService
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('busService', [ '$rootScope', '$log', '$resource', 'maps', 'renderingService', 'configuration', 
        function ($rootScope, $log, $resource, maps, render, conf) {
    // AngularJS will instantiate a singleton by calling "new" on this function
      

      // given an xml string - d - return the child nodes
      //  minus any text nodes
      function getNodes(d) {
          var parser = new DOMParser();
          var xmldoc = parser.parseFromString(d, "text/xml");
          var nodes = _.reject(xmldoc.documentElement.childNodes, function(n) { return n.nodeType === Node.TEXT_NODE; });

          return { 'nodes': nodes };
      }

      // helper to minimise the number of times I need to write
      //  getAttribute to..... 1
      function get(o, attributeList, extra) {
          var d = {};
          angular.forEach(attributeList, function(v,k) {
              d[v] = o.getAttribute(v);
          })

          // this will be an object keyed on the attributes attributeList
          //  with the corresponding value extracted from the node
          return _.extend(d, extra);
      }

      // get the list of agencies
      function getRoutes() {
          // go on and get the routes
          var routes = bus.resource.get({ 'command': 'routeList' }, function() {

              // construct the array of routes;
              _.each(routes.nodes, function(d) { 
                  var data = get(d, ['tag', 'title'], { 'selected': true, 'paths': [], 'stops': [] });
                  bus.routes[data.tag] = data;
              });

              // to make things easier when getting the locations, extract the tags
              //  out into an array
              bus.routeTags = _.pluck(bus.routes, 'tag');

              // and create a data array keyed on tag to sore route data


              //$log.debug('S:bus-service; getRoutes; routes', bus.routes);
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
          render.renderVehicleLocations(bus.locations);
      }

      function toggleRoute(tag) {
          // add or remove the tag from our list
          if (bus.selectedRoutes.indexOf(tag) === -1) {
              // not currently selected so add it
              bus.selectedRoutes.push(tag);

              // download paths and stops if we don't yet have them for the selected route
              //  Basically, anytime a route is selected we add paths and stops to the routes object
              if (_.isEmpty(bus.routes[tag].paths)) {
                  var routeConfigs = bus.resource.get({ 'command': 'routeConfig', 'r': tag  }, function() {
                      // $log.info('S:bus-service; toggleRoute; paths & stops', routeConfigs);
                      var nodes = _.groupBy(getNodes(routeConfigs.nodes[0].outerHTML).nodes, function(d) {
                          return d.localName;
                      });

                      // extract the bounding box of the route
                      var bbox = get(routeConfigs.nodes[0], [ 'latMin', 'latMax', 'lonMin', 'lonMax' ]);
                      var stops = [], paths = [];

                      // get the stop data into a useable form
                      _.each(nodes.stop, function(d) { stops.push(get(d, [ 'tag', 'title', 'lat', 'lon', 'stopId' ])); });

                      // get the path data into a useable form
                      _.each(nodes.path, function(d) { paths.push(getNodes(d.outerHTML).nodes); });
                      _.each(paths, function(d,i) { 
                          paths[i] = _.map(d, function(e) { 
                              var f = get(e, [ 'lat', 'lon' ]); 
                                  return [ f.lon, f.lat ];
                              }) 
                      });
                      
                      // stash the data
                      bus.routes[tag].paths = paths;
                      bus.routes[tag].stops = stops;
                      bus.routes[tag].bbox = bbox;
                      //$log.debug('S:bus-service, toggleRoute, routeData', bus.routes[tag]);
                      
                      // now that we have this path go ahead and render it
                      render.renderPaths(tag, bus.routes[tag].paths);

                      // toggle bus visibility or not
                      render.toggleBusVisibility(bus.selectedRoutes, bus.locations);
                  })
              } else {
                  // we already have this path so go ahead and render it
                  render.renderPaths(tag, bus.routes[tag].paths);

                  // toggle bus visibility or not
                  render.toggleBusVisibility(bus.selectedRoutes, bus.locations);
              }
          } else {
              // currently selected so remove it
              bus.selectedRoutes.splice(bus.selectedRoutes.indexOf(tag), 1);

              // since we know a path is drawn; select it and remove it
              d3.selectAll(".path_route_" + tag).remove();

              // toggle bus visibility or not
              render.toggleBusVisibility(bus.selectedRoutes, bus.locations);
          }

          // cycle through the routes toggling on or off as required
          angular.forEach(bus.routes, function(v,k) {
              // mark those that are selected
              if (!_.isEmpty(bus.selectedRoutes)) {
                  bus.routes[k].selected = bus.selectedRoutes.indexOf(v.tag) === -1 ? false : true;
              } else {
                  bus.routes[k].selected = true;
              }
          })
      }

      function getStopNextBus(routeTag, stopId) {
        var predictions = bus.resource.get({ 'command': 'predictions', 'r': routeTag, 's': stopId, 'useShortTitles': true }, function() {
            var nodes = _.groupBy(getNodes(predictions.nodes[0].outerHTML).nodes, function(d) {
                return d.localName;
            })

            // extract the title
            try {
                var directionTitle = get(nodes.direction[0], ['title']);

                // get the predictions from the node
                var ps = getNodes(nodes.direction[0].outerHTML).nodes;
                var nextBusPredictions = [];
                _.each(ps, function(d) { nextBusPredictions.push(get(d, ['minutes', 'affectedByLayover'])); });

                // stash the data
                bus.nextBus = {
                    'title': directionTitle.title,
                    'predictions': nextBusPredictions
                }
            } catch (e) {
                // stash the data
                bus.nextBus = {
                    'noneScheduled': true
                }
            }

            $rootScope.$broadcast('bus-prediction-ready');

        })
      }
      var bus = {
          // instance variables
          routes: {},
          routeTags: [],
          locations: [],
          routeLocationsLastTime: {},
          selectedRoutes: [],
          nextBus: {},

          // ng-resource: resource service
          resource: $resource('http://webservices.nextbus.com/service/publicXMLFeed?a=sf-muni', {}, {
              get: { 
                  command: '@command',
                  transformResponse: getNodes 
              },
          }),

          // methods
          getRoutes: getRoutes,
          getVehicleLocations: getVehicleLocations,
          toggleRoute: toggleRoute,
          getStopNextBus: getStopNextBus,
      }

      return bus;
  }]);
