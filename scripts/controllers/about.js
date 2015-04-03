'use strict';

/**
 * @ngdoc function
 * @name challengeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the challengeApp
 */
angular.module('challengeApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
