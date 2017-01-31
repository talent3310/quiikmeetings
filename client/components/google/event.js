
'use strict';

angular.module('calendarApp')
  .factory('Event', function ($location, $rootScope, $http, $q) {
    return {
      /**
       * creates a new event
       * @param data
       * @param callback
       */
      createEvent: function (data, callback) {
        var cb = callback || angular.noop;
        $http.post('/api/events', data)
          .success(function (response) {
            return cb(null,response);
          }).
          error(function (err) {
            return cb(err,null);
          }.bind(this));
      },
      /**
       * saves the attendees
       * @param attendees
       * @param eventID
       * @param callback
       * @returns {jQuery.promise|promise.promise|d.promise|promise|r.promise|.ready.promise|*}
       */
      saveParticipants: function (attendees, eventID, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/participants', {
          attendees: attendees,
          event_id: eventID
        })
          .success(function (response) {
            deferred.resolve(response);
            return cb(response);
          }).
          error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },

      /**
       * get attendees for an event
       * @param eventID
       * @param callback
       */
      getAttendees : function(eventID, callback){
        var cb = callback || angular.noop;
        $http.get('/api/participants/' + eventID)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      }
    };
  });