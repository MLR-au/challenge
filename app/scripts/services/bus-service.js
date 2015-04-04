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
      function get(o, attr) {
          return o.getAttribute(attr);
      }

      // get the list of agencies
      function getAgencies() {
          bus.agencies = [];
          var agencies = bus.resource.get({ 'command': 'agencyList' }, function() {
              angular.forEach(agencies.nodes, function(v,k) {
                  // extract the tag - we need it for later
                  var tag = get(v, 'tag');
                  
                  // push the bus data out
                  bus.agencies.push({
                      'tag': tag,
                      'title': get(v, 'title'),
                      'regionTitle': get(v, 'regionTitle') 
                  });

                  // get the agency data
                  bus.getAgencyInfo(tag);
              })
              //$log.info(bus.agencies);
          });
      }

      function getAgencyInfo(tag) {
          var routes = bus.resource.get({ 'command': 'routeList', 'a': tag }, function() {
              var r = [] 
              angular.forEach(routes.nodes, function(v,k) {
                  r.push({ 
                      'tag': get(v, 'tag'),
                      'title': get(v, 'title')
                  });
              })

              // add the routes list into the appropriate agency object
              var a = _.find(bus.agencies, function(d) { return d.tag === tag; }).routes = r;
          });
      }

      var bus = {
          resource: $resource('http://webservices.nextbus.com/service/publicXMLFeed?command=:command', {}, {
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
          getAgencies: getAgencies,
          getAgencyInfo: getAgencyInfo,
      }
      return bus;
  }]);
