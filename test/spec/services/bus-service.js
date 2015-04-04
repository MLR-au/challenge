'use strict';

describe('Service: busService', function () {

  // load the service's module
  beforeEach(module('challengeApp'));

  // instantiate service
  var busService;
  beforeEach(inject(function (_busService_) {
    busService = _busService_;
  }));

  it('should do something', function () {
    expect(!!busService).toBe(true);
  });

});
