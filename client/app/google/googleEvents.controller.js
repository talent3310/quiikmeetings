/**
 * Created by sohel on 6/27/15.
 */

'use strict';
angular.module('calendarApp')
  .controller('GoogleEventsCtrl', ['$scope', '$state', 'Bootbox', '$location', '$timeout', 'Auth', 'GoogleCalendar', 'EventThread', 'User', 'Review', 'Event',
    function ($scope, $state, Bootbox, $location, $timeout, Auth, GoogleCalendar, EventThread, User, Review, Event) {

      $scope.user = {};
      $scope.google = {};
      $scope.thread = {
        meeting_type: 'Executive',
        comment_type: 'Enable'
      };
      $scope.googleEvents = [];
      $scope.dateRange = {};
      $scope.dialog = {};
      $scope.newEvent = {};
      $scope.event_type = {
        type: 'existing_events'
      };

      $scope.dateRanges = {};
      $scope.eventThreads = [];
      // show default value for this month
      $scope.dateRange.startDate = moment().startOf('month');
      $scope.dateRange.endDate = moment().endOf('month');

      //load thread object
      if($state.params.thread_id){
        $scope.thread_id = $state.params.thread_id;
        var thread = _.find(EventThread.threads, function (thread) {
          return thread.id === $scope.thread_id;
        });

        if(thread){
          $scope.thread = thread;

          //if not from google event then set the new event
          if(!$scope.thread.from_google_event){
            $scope.newEvent = $scope.thread.events[0];
            $scope.newEvent.start = moment($scope.newEvent.start,"YYYY-MM-DD").format('YYYY-MM-DD');
          }
        }
      }

      $scope.showGoogleEvents =   $scope.thread._id? $scope.thread.from_google_event : true;
      //show and hide extra input box for new event
      $scope.showGoogleEventsDiv = function (state) {
        $scope.showGoogleEvents = state;
      };

      $scope.user = Auth.getCurrentUser();

      // The bellow object is used set date range calender ranges.
      // This will override default ranges
      $scope.dateRange.dateRanges = {
        'Today': [moment(), moment()],
        'Tomorrow': [moment().add(1, 'days'), moment().add(1, 'days')],
        'Next 7 Days': [moment(), moment().add(6, 'days')],
        'Next 30 Days': [moment(), moment().add(29, 'days')],
        'This Month': [moment().startOf('month'), moment().endOf('month')]
      };

      if($scope.thread){
        if($scope.thread.events){
          var minDateEvent =  _.min($scope.thread.events, function(event){ return moment(event.start,"YYYY-MM-DD"); });
          var maxDateEvent =  _.max($scope.thread.events, function(event){ return moment(event.end,"YYYY-MM-DD"); });
          $scope.dateRange.startDate = moment(minDateEvent.start);
          $scope.dateRange.endDate  = moment(maxDateEvent.end);
        }
      }


      if (!$scope.user.google_calendar_token) {
        $scope.authUrl = GoogleCalendar.getAuthUrl(function (err, data) {
          if (data) {
            $scope.authUrl = data;
          }
        });
      } else {
        //load event for default selected date range
        // it need some delay to ready DOM
        $timeout(function () {
          //load google event only if the the thread is created from it
          //or it is undefined
          if(typeof ($scope.thread.from_google_event) === 'undefined' || $scope.thread.from_google_event){

            $scope.getEventsByDateRange();
          }
        });
      }


      /**
       *Populate all event from google calender within date range selection change
       *
       */
      $scope.getEventsByDateRange = function () {

        //Check date range selection is properly done
        if ($scope.dateRange.startDate !== undefined && $scope.dateRange.endDate !== undefined && $scope.dateRange.startDate !== '' && $scope.dateRange.endDate !== '') {
          console.log(' Date Range ', $scope.dateRange.startDate, $scope.dateRange.endDate);
          // convert date from and date to in ISO string format. Google calender accept min and max time in ISO format
          var dateFrom = $scope.dateRange.startDate.toISOString();
          var dateTo = $scope.dateRange.endDate.toISOString();
          console.log(' ISO ', dateFrom, dateTo);

          /**
           * populate all events from google calender api
           */
          GoogleCalendar.getEvents(dateFrom, dateTo, function (error, response) {
            if (!error) {
              // bind all event for rendering user interface
              $scope.googleEvents = response;
              //checkbox checked
              if ($scope.thread._id) {
                _.each($scope.googleEvents, function (event) {
                  for (var i = 0; i < $scope.thread.events.length; i++)
                    if (event.id == $scope.thread.events[i].id) {
                      event['selected'] = true;
                    }
                });
                console.log('updated google events : ', $scope.googleEvents);
              }
            }
            else {
              //log error due to fail google calender api
              console.log(error);
            }
          });
        }
      };

      $scope.checkEventSelected = function ($e, event) {
        var checkbox = $e.target;
        event.selected = checkbox.checked;
        console.log(event);
      };

      /**
       * methods for saving event threads
       */
      $scope.saveThread = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
          //create new event and save the thread
          if (!$scope.showGoogleEvents && $scope.newEvent.summary) {
            $scope.newEvent.google_event = 'false';
            Event.createEvent($scope.newEvent, function (error, response) {
              if (!error) {
                console.log('response', response);
                $scope.thread.events = [];
                $scope.thread.events.push({
                  id: response._id,
                  _id: response._id,
                  start: response.start,
                  end : response.start,
                  summary: response.summary,
                  google_event: response.google_event
                });

                $scope.thread.user_id = $scope.user._id;
                console.log('$scope.thread', $scope.thread);

                //save the thread
                $scope.thread.from_google_event = false;
                EventThread.saveThread($scope.thread)
                  .then(function () {
                    $('#thread-name-dialog').modal('hide');
                    var msg = 'New thread has been created.';
                    Bootbox.showAlert(msg);

                    //TODO : put clear data code here
                    //put clear data
                    $scope.newEvent.summary = '';
                    $scope.newEvent.start = '';

                    $scope.thread.name = '';
                    $scope.thread.meeting_purpose = '';
                    $scope.thread.reason = ''
                  })
                  .catch(function (err) {
                    $scope.errors = {};
                    // Update validity of form fields that match the mongoose errors
                    angular.forEach(err.errors, function (error, field) {
                      form[field].$setValidity('mongoose', false);
                      $scope.errors[field] = error.message;
                      console.log(error.message)
                    });
                  });
              }
              else {
                console.log('error', error);
              }
            });
          }

          // save thread with existing events
          else {
            //find the selected events
            var selectedEvents = _.where($scope.googleEvents, {'selected': true});
            //push the event ids in events array so that we can use it for finding events later
            $scope.thread.events = [];
            _.each(selectedEvents, function (event) {
              $scope.thread.events.push({
                id: event.id,
                summary: event.summary,
                htmlLink: event.htmlLink,
                start: event.start.dateTime ? event.start.dateTime : event.start.date,
                end: event.end.dateTime ? event.end.dateTime : event.end.date
              });
            });

            $scope.thread.user_id = $scope.user._id;
            console.log($scope.thread);
            $scope.thread.from_google_event = true;

            EventThread.saveThread($scope.thread)
              .then(function () {
                $('#thread-name-dialog').modal('hide');
                var msg = 'New thread has been created.';
                Bootbox.showAlert(msg);

                //TODO : put clear data code here
                //put clear data
                $scope.thread.name = '';
                //$scope.thread.meeting_type = '';
                //$scope.thread.comment_type = '';
                $scope.thread.meeting_purpose = '';
                $scope.thread.reason = ''
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
        }
      };

      //load threads, for event threads only
      // it need some delay to ready DOM
      if ($location.path().indexOf('/event_threads') >= 0) {
        $timeout(function () {
          $scope.getEventThreads();
        });
      }

      $scope.getEventThreads = function () {
        EventThread.getThreads(function (err, response) {
          if (!err) {
            console.log(response);
            $scope.eventThreads = response;

            //save the data for future uses
            EventThread.setThreads(response);
            $scope.idList = _.pluck(response, function (item) {
              return item.id;
            });

            // calculate average value and progress for each thread
            Review.getAllReviews($scope.idList, function (error, response) {
              var avgList = [];
              if (!error) {
                //save the data for future uses
                EventThread.setReviews(response);
                avgList = Review.findAverageOfReviews(response);
                console.log('got the average : ', avgList);
              }

              if (avgList.length > 0) {
                //save the data for future uses
                EventThread.setAverages(avgList);

                _.each($scope.eventThreads, function (thread) {
                  var avg = _.find(avgList, function (avg) {
                    return avg.thread_id === thread.id;
                  });
                  thread.avgValue = avg ? avg.avgValue : 0;
                  thread.avgProgress = avg ? avg.avgProgress : 0;
                });
              }
            });
          }
        });
      };


      /**
       * open auth code dialog
       */
      $scope.authorizeClicked = function () {
        $scope.dialog.open();
      };


      /**
       * save button lick handler
       */
      $scope.saveCode = function () {
        if ($scope.google.auth_code === '') {

          var msg = 'Enter auth code';
          Bootbox.showAlert(msg);
          return;
        }
        console.log($scope.google.auth_code);

        var data = {
          auth_code: $scope.google.auth_code
        };
        GoogleCalendar.saveToken(data)
          .then(function (data) {
            var msg = 'The auth code has been saved successfully!';
            Bootbox.showAlert(msg);
            $scope.dialog.close();
            console.log(data);
            $scope.user.google_calendar_token = data.token;

            $timeout(function () {
              $scope.getEventsByDateRange();
            });

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
    }]);