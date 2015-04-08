'use strict';

describe('Directive: mapControls', function () {

  // load the directive's module
  beforeEach(module('challengeApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

//  it('should make hidden element visible', inject(function ($compile) {
//    element = angular.element('<map-controls></map-controls>');
//    element = $compile(element)(scope);
//    expect(element.text()).toBe('this is the mapControls directive');
//  }));
});
