/**

 * User: Sohel
 * Date: 6/26/15
 * Time: 4:47 PM
 */
'use strict';

angular.module('calendarApp')
  .controller('GoogleCalendarCtrl', ['$scope', 'Bootbox', '$location', '$timeout', 'Auth', 'GoogleCalendar', function ($scope, Bootbox, $location, $timeout, Auth, GoogleCalendar) {

    $scope.calendarObj = {
      availabilityData: [],
      listeners: {
        /**
         * View render is used to render calender and populate event from
         * google calender with date navigation
         * @param view
         * @param element
         */
        viewRender: function (view, element) {

          var events = [];
          // convert date from and date to in ISO string format. Google calender accept min and max time in ISO format
          var dateFrom = view.start.toDate().toISOString();
          var dateTo = view.end.toDate().toISOString();

          /**
           * populate all events from google calender api
           */
          GoogleCalendar.getEvents(dateFrom, dateTo, function (error, response) {
            if (!error) {
              // bind all event for rendering user interface
              _.each(response, function (responseEvent) {
                events.push({
                  id: responseEvent.id,
                  attendees: responseEvent.attendees,
                  date: moment(responseEvent.start.dateTime).format('YYYY-MM-DD'),
                  title: '\n' + responseEvent.summary,
                  start: responseEvent.start.dateTime,
                  end: responseEvent.end.dateTime
                });
              });
              $scope.calendarObj.availabilityData = events;
            }
            else {
              //log error due to fail google calender api
              console.log(error);
            }
          });
        },
        /**
         * When any event is selected from calender this event
         * is fired. no logic is implemented now
         * @param date
         * @param start
         * @param end
         * @param view
         */
        select: function (date, start, end, view) {

        },
        /**
         * When click any event from calender this event
         * is fired. no logic is implemented now
         * @param calEvent
         * @param jsEvent
         * @param view
         */
        eventClick: function (calEvent, jsEvent, view) {

        }
      }
    };
  }]);