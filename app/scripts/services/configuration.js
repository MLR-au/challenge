'use strict';

/**
 * @ngdoc service
 * @name challengeApp.configuration
 * @description
 * # configuration
 * Constant in the challengeApp.
 */
angular.module('challengeApp')
  .constant('configuration', {
      'layers': [ 'neighborhoods', 'streets', 'arteries', 'freeways' ],
      //'layers': [ 'neighborhoods' ],

      'colour': d3.scale.category20()


  });
