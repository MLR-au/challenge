'use strict';

/**
 * @ngdoc service
 * @name challengeApp.busService
 * @description
 * # busService
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('busService', [ '$log', '$resource', function ($log, $resource) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    //
      
      // helper to minimise the number of times I need to write
      //  getAttribute to..... 1
      function get(o, attributeList) {
          var d = {};
          angular.forEach(attributeList, function(v,k) {
              d[v] = o.getAttribute(v);
          })

          // this will be an object keyed on the attributes attributeList
          //  with the corresponding value extracted from the node
          return d;
      }

      // get the list of agencies
      function getRoutes() {
          bus.routes = [];
          var routes = bus.resource.get({ 'command': 'routeList' }, function() {
              angular.forEach(routes.nodes, function(v,k) {
                  // extract the tag - we need it for later
                  var tag = get(v, 'tag');
                  
                  // push the bus data out
                  bus.routes.push(get(v, [ 'tag', 'title' ]));

                  // get the agency data
                  //bus.getAgencyInfo(tag);
              })
              $log.debug('S:bus-service; getRoutes; routes', bus.routes);
          });
      }

      var bus = {
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
          getRoutes: getRoutes,
      }
      return bus;
  }]);
