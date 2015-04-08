'use strict';

/**
 * @ngdoc service
 * @name challengeApp.maps
 * @description
 * # maps
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('maps', [ '$http', '$log', '$rootScope', '$location', 'configuration',
        function ($http, $log, $rootScope, $location, conf) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    function get(layers) {
        if (! _.isArray(layers)) layers = [layers];

        var layer = layers.shift();
        maps.loadingMessage = 'loading ' + layer + '...';
        $rootScope.$broadcast('loading-map');

        if (conf.path) {
            var url = conf.path + '/data/topojson/' + layer + '.json';
        } else {
            var url = '/data/topojson/' + layer + '.json';
        }
        $http.get(url).then(function(resp) {
            //$log.debug(layer, resp.data);
            $log.info("Getting layer: ", layer);
            maps.mapData.push({ 'name': layer, 'data': resp.data });
            next(layers);
        }, 
        function(resp) {
            $log.error("Couldn't retrieve data for: ", layer);
        });
    }

    function next(layers) {
        if (!_.isEmpty(layers)) {
            // more maps to get so go get them
            maps.get(layers);
        } else {
            // no more maps to get - so start rendering
            $rootScope.$broadcast('render-maps');
        }
    }

    var maps = {
        //  instance variables
        mapData: [],

        // methods
        get: get,
    };
    return maps;

  }]);
