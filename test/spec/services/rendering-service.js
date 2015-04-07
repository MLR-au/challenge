'use strict';

describe('Service: renderingService', function () {

  // load the service's module
  beforeEach(module('challengeApp'));

  // instantiate service
  var renderingService;
  beforeEach(inject(function (_renderingService_) {
    renderingService = _renderingService_;
  }));

  it('should do something', function () {
    expect(!!renderingService).toBe(true);
  });

});
