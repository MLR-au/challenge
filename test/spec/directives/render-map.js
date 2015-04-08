'use strict';

describe('Directive: renderMap', function () {

  // load the directive's module
  beforeEach(module('challengeApp'));

  var element, $compile, $rootScope;

  // load the template
  beforeEach(module("my.templates"));

  beforeEach(inject(function (_$rootScope_, _$compile_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
  }));

  it('', inject(function () {
      element = angular.element('<div class="row"><render-map></render-map></div>');
      element = $compile(element)($rootScope);

  }));
});
