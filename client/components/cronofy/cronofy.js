/**
 * Created by david on 12/14/16.
 */
 
'use strict';

angular.module('calendarApp')
  .factory('Cronofy', function ($location, $rootScope, $http, $q, Auth) {
    return {


      /**
       * get auth url
       * @param callback
       */
      getAuthUrl: function (callback) {
        var cb = callback || angular.noop;
        $http.get('/api/cronofy/auth_url')
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
        $http.post('/api/cronofy/save_token', data)
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
       * save token
       * @param data
       * @param callback
       * @returns {jQuery.promise|promise.promise|promise|d.promise|.ready.promise|jQuery.ready.promise}
       */
      refreshToken: function (callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/cronofy/refresh_token')
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
       * get all events from Cronofy calender within date range
       * @param dateFrom
       * @param dateTo
       * @param callback
       */
      getEvents : function (dateFrom, dateTo, callback) {
        var cb = callback || angular.noop;
        console.log ("Gonna get events");

        // call api to populate all events
        $http.get('/api/cronofy/events'+ '/' + dateFrom + '/' + dateTo)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },

      /**
       * get the selected event from Cronofy calender
       * @param eventId
       * @param callback
       */
      getSelectedEvent : function (eventId, callback) {
        var cb = callback || angular.noop;

        // call api to populate all events
        $http.get('/api/cronofy/events'+ '/' + eventId )
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },

      /**
       * create a push notification for real updating
       */
      createPushNotification : function (callback) {
        var cb = callback || angular.noop;
        
        // call api to populate all events
        $http.get('/api/cronofy/createPushNotification')
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },
    };
  });