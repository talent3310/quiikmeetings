/**
 * Created by sohel on 6/27/15.
 */



'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('google_calendar', {
        url: '/google_calendar',
        templateUrl: 'app/google/googleCalendar.html',
        controller: 'GoogleCalendarCtrl'
      })
      .state('create_thread', {
        url: '/create_thread',
        templateUrl: 'app/google/googleEvents.html',
        controller: 'GoogleEventsCtrl'
      })
      .state('event_threads', {
        url: '/event_threads',
        templateUrl: 'app/google/eventThreads.html',
        controller: 'GoogleEventsCtrl'
      })
      .state('event_review', {
        url: '/event_review/:email/:thread_id/:event_id',
        templateUrl: 'app/google/eventReview.html',
        controller: 'EventReviewCtrl'
      })
      .state('select_calendar', {
        url: '/select_calendar',
        templateUrl: 'app/google/selectCalendar.html',
        controller: 'SelectCalendarCtrl'
      })
      .state('edit_thread', {
        url: '/edit_thread/:thread_id',
        templateUrl: 'app/google/googleEvents.html',
        controller: 'GoogleEventsCtrl'
      })
  });