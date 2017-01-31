'use strict';

angular.module('calendarApp')
  .controller('CalendarCtrl', ['$scope', 'Availability', 'Bootbox', '$location', '$timeout', 'Auth', function ($scope, Availability, Bootbox, $location, $timeout, Auth) {

    //used for triggering show dialog

    //a scope object declared for using it to store
    // a method, open() from dialog directive event
    // so that we can trigger dialog open from here
    $scope.dialog = {};
    $scope.meeting = {};
    $scope.meeting.duration = 1;
    $scope.calendarObj = {
      availabilityData: [
        {
          title: 'All Day Event',
          start: moment().format('YYYY-MM-DD')
        }
      ],
      listeners: {
        select: function (date, start, end, view) {
          $scope.meeting.meetingDate = moment(date).format('YYYY-MM-DD');

          $('#newStartTime').data("DateTimePicker").clear();
          $('#newEndTime').data("DateTimePicker").clear();

          $scope.setEndTimeOnChange();


        },
        eventClick: function (calEvent, jsEvent, view) {

          $scope.meeting.meetingDate = moment(calEvent.date).format('YYYY-MM-DD');

          $('#newStartTime').data("DateTimePicker").clear();
          $('#newEndTime').data("DateTimePicker").clear();
          var tempstarttime = moment().format('YYYY-MM-DD') + 'T' + calEvent.start_time;
          $('#newStartTime').data("DateTimePicker").date(moment(tempstarttime));
          $scope.setEndTimeOnChange();
        }
      }
    };

    //remove the calendar events for non admins
    if(!Auth.isAdmin()){
      $scope.calendarObj.listeners = {};
    }

    $scope.populateUserAvailabilityByDate = function (availabilityDate, meetingStartTime, meetingEndTime) {
      $scope.availableSlots = [];
      var tempAvailability = [];
      Availability.getUserAvailabilities(moment(availabilityDate).format("YYYY-MM-DD"), function (err, availability) {
        if (availability) {

          _.each(availability, function (available) {
            var slots = _.filter(available.free_times, function (time) {
              return $scope.isSlotMatch(meetingStartTime, meetingEndTime, time.start_time, time.end_time) == true;
            });

            if (slots.length > 0) {
              var item = {
                user_id: {
                  email: available.user_id.email,
                  firstname: available.user_id.firstname,
                  lastname: available.user_id.lastname
                },
                free_times: slots
              };
              tempAvailability.push(item);
            }

          });
          $scope.availableSlots = tempAvailability;


          $scope.dialog.open();
        }
      });
    }


    /**
     * event handler for check all
     * @param $event
     * @param times
     * @param slot
     * @constructor
     */
    $scope.checkParentSelectSlot = function ($event, times, slot) {
      var checkbox = $event.target;
      slot.selected = checkbox.checked;

      // check/uncheck all the slots based on the parent selection
      for (var i = 0; i < times.length; i++) {
        times[i].selected = slot.selected;
      }
    };

    /**
     * event handler for check slot
     * @param $event
     * @param times
     * @param slot
     * @param time
     * @constructor
     */

    $scope.checkSelectSlot = function ($event, times, slot, time) {
      //check/uncheck the slot based on the  selection
      var checkbox = $event.target;
      time.selected = checkbox.checked;

      var checkedSlots = _.filter(times, function (time) {
        return time.selected;
      });

      //check/uncheck the parent selection if all the slots are checked
      slot.selected = (checkedSlots.length === times.length);
    };

    Availability.getUserAllAvailabilities(function (err, availabilities) {
      var events = [];
      if (availabilities) {

        _.each(availabilities, function (availability) {
          _.each(availability.free_times, function (free_time) {
            events.push({
              id: free_time._id,
              date: availability.date,
              firstname: availability.user_id.firstname,
              lastname: availability.user_id.lastname,
              email: availability.user_id.email,
              start_time: free_time.start_time,
              end_time: free_time.end_time,
              title: '\n' + availability.user_id.firstname,
              start: availability.date + 'T' + free_time.start_time,
              end: availability.date + 'T' + free_time.end_time
            });
          });
        });
        $scope.calendarObj.availabilityData = events;
      }
      else {
        $scope.error = err;
      }
    });

    $scope.setEndTimeOnChange = function () {

      if ($scope.meeting.meetingStartTime !== undefined && $scope.meeting.meetingStartTime !== '') {
        var enddatetime = moment().format('YYYY-MM-DD') + 'T' + $scope.meeting.meetingStartTime;
        $scope.meeting.meetingEndTime = moment(enddatetime).add('hours', $scope.meeting.duration).format('HH:mm:ss');

      }
      $scope.populateUserAvailabilityByDate($scope.meeting.meetingDate, $scope.meeting.meetingStartTime, $scope.meeting.meetingEndTime);

    };

    $scope.AddUserAvailability = function () {
      $timeout(function () {
        $location.path('/add-user-availability');
      }, 800);

      $scope.dialog.close();

    };
    /**
     * send invitation
     */
    $scope.sendInvites = function () {

      if ($scope.meeting.Agenda === undefined || $scope.meeting.Agenda === '') {

        var msg = 'Enter agenda';
        Bootbox.showAlert(msg);
        return;
      }

      if (( $scope.meeting.meetingStartTime === undefined || $scope.meeting.meetingStartTime === '') || ( $scope.meeting.meetingEndTime === undefined || $scope.meeting.meetingEndTime === '')) {

        var msg = 'Select agenda time';
        Bootbox.showAlert(msg);
        return;
      }

      var inviteData = [];
      _.each($scope.availableSlots, function (slot) {

        var checkedSlots = _.filter(slot.free_times, function (time) {
          return time.selected;
        });

        if (checkedSlots.length > 0) {
          inviteData.push({
            email: slot.user_id.email,
            agenda: $scope.meeting.Agenda,
            agendaTime: $scope.meeting.meetingDate,
            agendaStartTime: $scope.meeting.meetingStartTime,
            agendaEndTime: $scope.meeting.meetingEndTime,
            agendaDuration: $scope.meeting.duration,
            free_times: checkedSlots
          });
        }
      });

      if (inviteData.length > 0) {

        Availability.sendInvitation(inviteData)
          .then(function () {
            var msg = 'The selected user(s) have been invited based on the selected time slots.';
            Bootbox.showAlert(msg);
            $scope.dialog.close();
          })
          .catch(function (err) {
            $scope.errors = {};
            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function (error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });

      }
      else {
        Bootbox.showAlert('Please chose at least one time slot!');
      }
      console.log(inviteData)

    };

    $scope.isSlotMatch = function (starttime, endtime, newstarttime, newendtime) {


      var startdate = moment(moment().format('YYYY-MM-DD') + 'T' + starttime);
      var enddate = moment(moment().format('YYYY-MM-DD') + 'T' + endtime);

      var newstartdate = moment(moment().format('YYYY-MM-DD') + 'T' + newstarttime);
      var Newenddate = moment(moment().format('YYYY-MM-DD') + 'T' + newendtime);

      console.log('Old ' + startdate.format('YYYY-MM-DD HH:mm:ss') + ' ' + enddate.format('YYYY-MM-DD HH:mm:ss'));

      console.log('New ' + newstartdate.format('YYYY-MM-DD HH:mm:ss') + ' ' + Newenddate.format('YYYY-MM-DD HH:mm:ss'));

      /* if(
       (newstartdate<=startdate && Newenddate>=startdate)
       ||
       (newstartdate<=enddate && Newenddate>=enddate)
       ||
       (startdate<=newstartdate && enddate>=newstartdate)
       ||
       (startdate<=Newenddate && enddate>=Newenddate)

       )*/
      if (
        (startdate >= newstartdate && startdate <= Newenddate)

        && (enddate <= Newenddate)
      ) {
        return true;
        //console.log('your selected new start time and new end time fall in your previous time');
      }
      else {
        return false;
        // console.log('You have select new start time and new end time');
      }
    }


  }]);


