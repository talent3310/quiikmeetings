/**
 * Created by sohel on 7/6/15.
 */


'use strict';

angular.module('calendarApp')
  .factory('EventThread', function($location, $rootScope, $http, $q, Auth) {
    return {
      setThreads: function(data) {
        this.threads = data;
      },

      setAverages: function(averages) {
        this.averages = averages;
      },

      setReviews: function(reviews) {
        this.reviews = reviews;
      },

      /**
       * get event threads
       * @param callback
       */
      getThreads: function(callback) {
        var cb = callback || angular.noop;
        $http.get('/api/event_thread')
          .success(function(data) {
            return cb(null, data);
          }).
        error(function(err) {
          return cb(err, null);
        }.bind(this));
      },

      archiveThread: function (thread_id, callback) {
        var cb = callback || angular.noop;

        $http.get ('/api/event_thread/archive/' + thread_id)
          .success (function (data) {
            return cb (null, err);
          })
          .error (function (err) {
            return cb (err, null);
          })
      },
      
      /**
       * get thread details
       * @param thread_id
       * @param callback
       */
      getThreadDetails: function(thread_id, callback) {
        var cb = callback || angular.noop;
        $http.get('/api/event_thread/thread_details' + '/' + thread_id)
          .success(function(data) {
            return cb(null, data);
          }).
        error(function(err) {
          return cb(err, null);
        }.bind(this));
      },

      /**
       * save thread
       * @param data
       * @param callback
       * @returns {jQuery.promise|promise.promise|promise|d.promise|.ready.promise|jQuery.ready.promise}
       */
      saveThread: function(data, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/event_thread', data)
          .success(function(response) {
            deferred.resolve(response);
            return cb(response);
          }).
        error(function(err) {
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      getAllEvents: function () {
        var events = [];
        _.each (this.threads, function (thread) {
          events = events.concat (_.map(thread.events, function (event) {
            event.thread = thread;
            return event;
          }));
        });
        var getDate = this.getDate;
        var completedEvents = _.filter(events, function(val) {
          return getDate(val).isBefore(moment());
        });
        var upcomingEvents = _.filter(events, function(val) {
          return getDate(val).isAfter(moment());
        });

        return {
          upcoming: upcomingEvents,
          completed: completedEvents,
          all: events
        }
      },
      getDate: function (val) {
          var input = {};
          if (val.start) {
            input = val.start;
          }
          var dt = null;
          if (input && input.dateTime) {
            dt = input.dateTime;
          } else if (input && input.date) {
            dt = input.date;
          } else if (input) {
            dt = input;
          } else {
            dt = new Date();
          }

          return moment(dt);
      },
      processThreads: function() {
        var self = this;
        var getDate = this.getDate;
        return _.map(this.threads, function(thread) {
          var events = thread.events;
          thread.completedEvents = _.filter(events, function(val) {
            return getDate(val).isBefore(moment());
          });
          thread.upcomingEvents = _.filter(events, function(val) {
            return getDate(val).isAfter(moment());
          });
          thread.completedCount = thread.completedEvents.length;
          thread.upcomingCount = thread.upcomingEvents.length;
          thread.movement = self.extractMovement (thread);
          return thread;
        });
      },

      extractMovement: function(thread) {
        var localScope = {};
        
        localScope.thread_id = thread.id;
        localScope.reviews = _.filter(this.reviews, function(review) {
          return review.thread_id === localScope.thread_id;
        });
        localScope.thread = thread;

        if (localScope.thread) {
          localScope.events = localScope.thread.events;
          localScope.nextEvent = localScope.thread.firstEvent;
        }

        console.log('In details vew: reviews : ', localScope.reviews, ' events: ', localScope.events);


        //get average value and progress
        var avg = _.find(this.averages, function(avg) {
          return avg.thread_id === localScope.thread_id
        });
        localScope.avgValue = avg ? avg.avgValue : 0;
        localScope.avgProgress = avg ? avg.avgProgress : 0;

        if (localScope.reviews && localScope.reviews.length > 0) {
          localScope.lastValue = localScope.reviews[localScope.reviews.length - 1];
        }

        var categories = [];

        var valueSeries = [{
          name: 'VALUE ',
          data: []
        }];

        var progressSeries = [{
          name: 'PROGRESS',
          data: []
        }];


        // group the review by events
        var groupedList = _.groupBy(localScope.reviews, function(item) {
          return item.event_id;
        });


        //iterate for each group
        _.each(groupedList, function(group, key) {
          var event = _.find(localScope.events, function(event) {
            //console.log(event.id, key)
            return event.id === key;
          });
          if (event) {
            categories.push(moment(event.start).format('YY/DD/MM'));

            var rankSum = 0,
              rankProgressSum = 0;
            _.each(groupedList[key], function(reviewData) {
              rankSum = rankSum + reviewData.rank_value;
              localScope.ranks = rankSum;
              rankProgressSum = rankProgressSum + reviewData.rank_progress;
            });

            valueSeries[0].data.push(parseFloat((rankSum / groupedList[key].length).toFixed(2)));
            progressSeries[0].data.push(parseFloat((rankProgressSum / groupedList[key].length).toFixed(2)));
          }
        });

        var valueItems = valueSeries[0].data;
        var progressItems = progressSeries[0].data;

        if (valueItems.length > 1 && progressItems.length > 1) {
          var calculate_change = function(values) {
            var full_avg = _.reduce(values, function(total, n) {
              return total + n;
            }) / values.length;
            var remaining_avg = _.reduce(_.initial(values), function(total, n) {
              return total + n;
            }) / (values.length - 1);

            return full_avg - remaining_avg;
          }

          var movement = {};


          localScope.valueChange = movement.valueChange = calculate_change(valueItems);
          movement.valueChangeClass = localScope.valueChange > 0 ? "average-good" : "average-bad";
          movement.valueChangeIcon = localScope.valueChange > 0 ? "fa-arrow-up" : "fa-arrow-down";
          localScope.progressChange = movement.progressChange = calculate_change(progressItems);
          movement.progressChangeClass = localScope.progressChange > 0 ? "average-good" : "average-bad";
          movement.progressChangeIcon = localScope.progressChange > 0 ? "fa-arrow-up" : "fa-arrow-down"


          movement.meetingBad = localScope.valueChange < 0 || localScope.progressChange < 0;

          return movement
        }

        return {};

      }


    };
  });