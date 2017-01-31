/**

 * User: Sohel
 * Date: 4/30/15
 * Time: 12:38 PM
 */
'use strict';


angular.module('calendarApp')
  .factory('CalendarUI', function () {
    return {

      /**
       *
       * @param options{config: {Object}, data: {} , }
       * @param element
       */
      init: function (options, element) {
        var config = {
            header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month, agendaWeek,agendaDay'
            },
            displayEventEnd: true,
            defaultDate: moment().format('YYYY-MM-DD'),
            selectable: true,
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            events: options.data
          } || options.config;

        //set the events if exists
        if (options.listeners) {
          _.each(options.listeners, function (listener, key) {
            config[key] = listener;
          });
        }
        //initialize the calender
        element.fullCalendar(config);
      }
    }
  });