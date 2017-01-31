'use strict';

angular.module('calendarApp')
  .directive('calendarDirective', ['CalendarUI', function (CalendarUI) {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        calendarObj: '='
      },
      link: function (scope, element, attrs) {

        var options = {
          data: scope.calendarObj.availabilityData,
          listeners: scope.calendarObj.listeners
        };

        scope.$watch('calendarObj.availabilityData', function (newdata, olddata) {
          element.fullCalendar('removeEvents');
          element.fullCalendar('addEventSource', scope.calendarObj.availabilityData);
          element.fullCalendar('rerenderEvents');
        });

        //initialize the calendar UI
        CalendarUI.init(options, element);
      }
    };
  }]);
