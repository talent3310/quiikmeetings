'use strict';

angular.module('calendarApp')
  .controller('AvailabilityCtrl', ['$scope', '$location', 'User', 'Availability', 'Bootbox', 'Auth', function ($scope, $location, User, Availability, Bootbox, Auth) {
    $scope.message = 'Hello';
    $scope.duration = "1";
    $scope.dateRange = {};
    $scope.user_id = '';
    $scope.userAvailabilities = [];
    // $scope.UserAvailability.free_times = [];


    $scope.setEndTimeOnChange = function () {
      if ($scope.newStartTime !== undefined && $scope.newStartTime !== '') {
        var enddatetime = moment().format('YYYY-MM-DD') + 'T' + $scope.newStartTime;
        $scope.newEndTime = moment(enddatetime).add('hours', $scope.duration).format('HH:mm:ss');
      }

    };

    $scope.addAvailability = function (itemAvailability) {
      var item = {};
      item.start_time = '';
      item.end_time = '';
      itemAvailability.push(item);

    };
    /**
     * get the user list
     */
    $scope.users = [];
    if(Auth.isAdmin()){
      $scope.users = User.query();
    }
    else{
      $scope.users.push(Auth.getCurrentUser());
      $scope.user_id = Auth.getCurrentUser()._id;
    }


    $scope.doTheBack = function () {
      window.history.back();
    };

    $scope.removeAvailability = function (itemAvailability, index) {
      itemAvailability.free_times.splice(index, 1);
    };

    $scope.getUserAvailability = function () {
      var userid = $scope.user_id;
      //  var date = $scope.UserAvailability.date;


      if (userid !== undefined && $scope.dateRange.startDate !== undefined && $scope.dateRange.endDate !== undefined && userid !== '' && $scope.dateRange.startDate !== '' && $scope.dateRange.endDate !== '') {
        var date_From = $scope.dateRange.startDate.format('YYYY-MM-DD');
        var date_To = $scope.dateRange.endDate.format('YYYY-MM-DD');

        $scope.userAvailabilities = [];
        Availability.getUserFreeTimesByDateRange(userid, date_From, date_To, function (err, availability) {
          if (availability) {
            $scope.userAvailabilities = availability;
          }
          else {
            $scope.error = err;
          }
        });
      }
    };

    /**
     * saves users record
     * @param form
     */
    $scope.saveAvailability = function (form) {

      if ($scope.dateRange.startDate === undefined || $scope.dateRange.endDate === undefined || $scope.dateRange.startDate === '' || $scope.dateRange.endDate === '') {
        var msg1 = 'Pick Date';

        Bootbox.showAlert(msg1);
        $scope.addAvailability();
        return;
      }


      if ($scope.newStartTime !== undefined && $scope.newEndTime !== undefined && $scope.newStartTime !== '' && $scope.newEndTime !== '') {

        // add and update the array between date range
        var startDate = moment($scope.dateRange.startDate).format('YYYY-MM-DD');
        var endDate = moment($scope.dateRange.endDate).format('YYYY-MM-DD');
        while (startDate <= endDate) {

          var availability = _.find($scope.userAvailabilities, function (userAvailability) {
            return userAvailability.date == startDate;
          });

          if (!availability) {
            var itemAvailability = {};
            itemAvailability.user_id = $scope.user_id;
            itemAvailability.date = startDate;
            itemAvailability.free_times = [];

            var item = {};
            item.start_time = $scope.newStartTime;
            item.end_time = $scope.newEndTime;
            itemAvailability.free_times.push(item);

            $scope.userAvailabilities.push(itemAvailability);
          }
          else {
            var freeTimes = availability.free_times;

            availability.free_times = [];
            freeTimes.forEach(function (freeTime) {
              if ($scope.isSlotMatch(freeTime.start_time, freeTime.end_time, $scope.newStartTime, $scope.newEndTime) == false) {

                var item = {};
                item.start_time = freeTime.start_time;
                item.end_time = freeTime.end_time;
                availability.free_times.push(item);
              }

            });


            var item = {};
            item.start_time = $scope.newStartTime;
            item.end_time = $scope.newEndTime;
            availability.free_times.push(item);
          }


          startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

        }

      }
      /* $scope.userAvailabilities.forEach( function( availability , index ){
       $scope.userAvailabilities[index].user_id = $scope.user_id;
       } );*/


      var data = $scope.userAvailabilities;
      Availability.saveUserAvailability(data)
        .then(function () {
          var msg = 'The user availability has been saved successfully';
          Bootbox.showAlert(msg);
          // $location.path('/add-user-availability');
          // $scope.newStartTime=null;
          // $scope.newEndTime=null;
          $('#newStartTime').data("DateTimePicker").clear();
          $('#newEndTime').data("DateTimePicker").clear();
        })
        .catch(function (err) {
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function (error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
    };


    $scope.isSlotMatch = function (starttime, endtime, newstarttime, newendtime) {


      var startdate = moment(moment().format('YYYY-MM-DD') + 'T' + starttime);
      var enddate = moment(moment().format('YYYY-MM-DD') + 'T' + endtime);

      var newstartdate = moment(moment().format('YYYY-MM-DD') + 'T' + newstarttime);
      var newenddate = moment(moment().format('YYYY-MM-DD') + 'T' + newendtime);

      console.log('Old ' + startdate.format('YYYY-MM-DD HH:mm:ss') + ' ' + enddate.format('YYYY-MM-DD HH:mm:ss'));

      console.log('New ' + newstartdate.format('YYYY-MM-DD HH:mm:ss') + ' ' + newenddate.format('YYYY-MM-DD HH:mm:ss'));

      if (
        (newstartdate <= startdate && newenddate >= startdate)
        ||
        (newstartdate <= enddate && newenddate >= enddate)
        ||
        (startdate <= newstartdate && enddate >= newstartdate)
        ||
        (startdate <= newenddate && enddate >= newenddate)

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
