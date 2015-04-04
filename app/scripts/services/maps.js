'use strict';

/**
 * @ngdoc service
 * @name challengeApp.maps
 * @description
 * # maps
 * Service in the challengeApp.
 */
angular.module('challengeApp')
  .service('maps', [ '$http', '$log', '$rootScope', function ($http, $log, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    function get(layers) {
        if (! _.isArray(layers)) layers = [layers];

        var layer = layers.shift();
        var url = '/data/topojson/' + layer + '.json';
        $http.get(url).then(function(resp) {
            $log.debug(layer, resp.data);
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
        mapData: [],
        get: get,
    };
    return maps;

  }]);
