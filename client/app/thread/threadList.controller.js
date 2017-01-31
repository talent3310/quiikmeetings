'use strict';
angular.module('calendarApp')
  .controller('ThreadListCtrl', ['$scope', '$state', 'Bootbox', '$location', '$timeout', 'Auth', 'GoogleCalendar', 'EventThread', 'User', 'Review', 'Event', 'reloader',
    function($scope, $state, Bootbox, $location, $timeout, Auth, GoogleCalendar, EventThread, User, Review, Event, reloader) {
      $scope.reloadData = function () {
        window.location.reload ();
      };
      EventThread.getThreads(function(err, response) {
        if (!err) {
          response = response.reverse();
          var eventThreads = response;

          //save the data for future uses
          EventThread.setThreads(response);

          _.each(EventThread.threads, function(thread) {
            var events = thread.events;
            events = _.filter(events, (function(event) {
              var start = event.start ? new Date(event.start) : new Date();
              return start.getTime() > new Date().getTime();
            }));
            var eventsSorted = _.sortBy(events, function(event) {
              var start = event.start ? new Date(event.start) : new Date();
              return start.getTime();
            })
            var allEventsSorted = _.sortBy(thread.events, function(event) {
              var start = event.start ? new Date(event.start) : new Date();
              return start.getTime();
            })

            if (eventsSorted[0]) {
              thread.firstEvent = eventsSorted[0];
            } else {
              thread.firstEvent = allEventsSorted[0];
              thread.noNextEvent = true;
            }
          });
          var idList = _.pluck(response, function(item) {
            return item.id;
          });

          // calculate average value and progress for each thread
          Review.getAllReviews(idList, function(error, response) {
            var avgList = [];
            if (!error) {
              //save the data for future uses
              EventThread.setReviews(response);
              avgList = Review.findAverageOfReviews(response);
            }

            if (avgList.length > 0) {
              //save the data for future uses
              EventThread.setAverages(avgList);

              _.each(eventThreads, function(thread) {
                var avg = _.find(avgList, function(avg) {
                  return avg.thread_id === thread.id;
                });
                thread.avgValue = avg ? avg.avgValue : 0;
                thread.avgProgress = avg ? avg.avgProgress : 0;
              });
            }
            $scope.eventThreads = EventThread.processThreads ();
            $scope.allSidebar = EventThread.getAllEvents ();
            $scope.setSidebar ('upcoming');
            $scope.sidebarMax = 5; // change this to show more by default
            $scope.sidebarLimit = $scope.sidebarMax;
          });
        }
      });

      $scope.toggleThread = function (index) {
        console.log("Toggling thread");
        $scope.eventThreads[index].expanded = !$scope.eventThreads[index].expanded;
      };

      $scope.classForEvent = function(event) {
        var date = $scope.convertToDate(event.end);

        if (date.getTime() < new Date().getTime()) {
          return "event-completed";
        }
        return '';
      }

      $scope.isEventCompleted = function (event) {
        var date = $scope.convertToDate(event.end);

        return (date.getTime() < new Date().getTime());
      }

      $scope.checkClass = function (label, thread) {
        return thread.expanded === label ? 'on' : '';
      };

      $scope.showUpcoming = function (thread) {
        thread.expanded = 'upcoming';
        thread.shownEvents = thread.upcomingEvents;
        $scope.sidebarLimit = $scope.sidebarMax;
      };

      $scope.showCompleted = function (thread) {
        thread.expanded = 'completed';
        thread.shownEvents = thread.completedEvents;
        $scope.sidebarLimit = $scope.sidebarMax;
      };

      $scope.showAll = function (thread) {
        thread.expanded = 'all';
        thread.shownEvents = thread.events;
        $scope.sidebarLimit = $scope.sidebarMax;
      };

      $scope.closeThread = function (thread) {
        thread.expanded = false;
        thread.shownEvents = [];
        $scope.sidebarLimit = $scope.sidebarMax;
      }

      $scope.setSidebar = function (key) {
        $scope.sidebar = key;
        $scope.sidebarEvents = $scope.allSidebar[key];
      };

      $scope.expandSidebar = function () {
        $scope.sidebarLimit = 100;
      }

      $scope.sidebarClass = function (key) {
        return $scope.sidebar === key ? "on":"";
      };

      $scope.archiveThread = function (thread) {
        EventThread.archiveThread (thread.id, function () {
          window.location.reload ();
        })
      }

      $scope.convertToDate= function (val) {
        var input = {};
        if (val.start) {
          input = val.start;
        }
        else {
          input = val;
        }
        var dt = null;
        if (input && input.dateTime) {
          dt = input.dateTime;
        }
        else if (input && input.date) {
          dt = input.date;
        }
        else if (input) {
          dt = input;
        }
        else {
          dt = new Date();
        }

        return new Date(dt);
      }

    }

  ])