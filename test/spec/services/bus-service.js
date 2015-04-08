'use strict';

describe('Service: busService', function () {

  // load the service's module
  beforeEach(module('challengeApp'));

  // globals
  var busService, $httpBackend;

  // instantiate service
  beforeEach(inject(function (_busService_, _$httpBackend_) {
    busService = _busService_;
    $httpBackend = _$httpBackend_;
  }));

  it('should exist', function () {
    expect(busService).toBeDefined();
  });

  it('should get routes', function() {
      $httpBackend.whenGET('http://webservices.nextbus.com/service/publicXMLFeed?a=sf-muni&command=routeList')
                  .respond('<body><route tag="F" title="F-Market & Wharves"/></body>');
      busService.getRoutes();
      $httpBackend.flush();
      dump(busService.routes, busService.routeTags);
  });

});
