/**
 * Created by sohel on 6/27/15.
 */
 
'use strict';

angular.module('calendarApp')
  .factory('GoogleCalendar', function ($location, $rootScope, $http, $q, Auth) {
    return {


      /**
       * get auth url
       * @param callback 
       */
      getAuthUrl: function (callback) {
        var cb = callback || angular.noop;
        $http.get('/api/google/auth_url')
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },

      /**
       * save token
       * @param data
       * @param callback
       * @returns {jQuery.promise|promise.promise|promise|d.promise|.ready.promise|jQuery.ready.promise}
       */
      saveToken: function (data, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/google/save_token', data)
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
       * get all events from google calender within date range
       * @param dateFrom
       * @param dateTo
       * @param callback
       */
      getEvents : function (dateFrom, dateTo, callback) {
        var cb = callback || angular.noop;
        console.log ("Gonna get events");

        // call api to populate all events
        $http.get('/api/google/events'+ '/' + dateFrom + '/' + dateTo)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },

      /**
       * get the selected event from google calender
       * @param eventId
       * @param callback
       */
      getSelectedEvent : function (eventId, callback) {
        var cb = callback || angular.noop;

        // call api to populate all events
        $http.get('/api/google/events'+ '/' + eventId )
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      }
    };
  });