'use strict';

describe('Directive: calendarDirective', function () {

  // load the directive's module and view
  beforeEach(module('calendarAppApp'));
  beforeEach(module('app/calendarDirective/calendar.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<calendar-directive></calendar-directive>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the calendarDirective directive');
  }));
});