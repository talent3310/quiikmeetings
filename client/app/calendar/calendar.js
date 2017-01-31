/**

 * User: Sohel
 * Date: 4/30/15
 * Time: 1:01 PM
 */


'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('calendar', {
        url: '/calendar',
        templateUrl: 'app/calendar/calendar.html',
        controller: 'CalendarCtrl'
      })
  });