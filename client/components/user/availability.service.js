/**
 * Created by delwar on 05/01/15.
 */

'use strict';

angular.module('calendarApp')
  .factory('Availability', function Stock($location, $rootScope, $http, $q, Auth) {
    return {

      /**
       * get all availabilities
       * @param callback
       */
      getUserAllAvailabilities: function (callback) {
        var cb = callback || angular.noop;
        var apiUrl = '/api/user_availability/user';
        if(Auth.isAdmin()){
          apiUrl = '/api/user_availability/all';
        }

        $http.get(apiUrl)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },

      /**
       * get user availabilities
       * @param date
       * @param callback
       */
      getUserAvailabilities: function (date, callback) {
        var cb = callback || angular.noop;
        $http.get('/api/user_availability/' + date)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },


      /**
       * get user free times
       * @param user_id
       * @param date
       * @param callback
       */
      getUserFreeTimes: function (user_id, date, callback) {
        var cb = callback || angular.noop;
        $http.get('/api/user_availability/free_times/' + user_id + '/' + date)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },

      /**
       * get user free times by date range
       * @param user_id
       * @param date_From
       * @param date_To
       * @param callback
       */
      getUserFreeTimesByDateRange: function (user_id, date_From, date_To, callback) {
        var cb = callback || angular.noop;
        $http.get('/api/user_availability/free_timesByDateRange/' + user_id + '/' + date_From + '/' + date_To)
          .success(function (data) {
            return cb(null, data);
          }).
          error(function (err) {
            return cb(err, null);
          }.bind(this));
      },
      /**
       * save new user data
       * @param data
       * @param callback
       * @returns {jQuery.promise|promise.promise|promise|d.promise|.ready.promise|jQuery.ready.promise}
       */
      saveUserAvailability: function (data, callback) {

        var cb = callback || angular.noop;
        var deferred = $q.defer();
        console.log(data);
        $http.post('/api/user_availability', data)
          .success(function (data) {
            deferred.resolve(data);
            return cb(data);
          }).
          error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },

      /**
       *
       * @param data
       * @param callback
       * @returns {jQuery.promise|promise.promise|promise|d.promise|.ready.promise|jQuery.ready.promise}
       */
      sendInvitation: function (data, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/user_availability/send_invites', data)
          .success(function (data) {
            deferred.resolve(data);
            return cb(data);
          }).
          error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      }
    };
  });
