'use strict';

angular.module('calendarApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
        id: '@_id'
      },
      {
        changePassword: {
          method: 'PUT',
          params: {
            controller:'password' 
          }
        },
        forgotPassword: {
          method: 'POST',
          params: {
            controller:'forgot_password'
          }
        },
        checkResetCode: {
          method: 'GET',
          params: {
            id: 'check_code',
            controller: 'email'
          }
        },
        getUsers: {
          method: 'GET',
          params: {
            id: 'all'
          }
        },
        get: {
          method: 'GET',
          params: {
            id: 'me'
          }
        },
        resetPassword: {
          method: 'POST',
          params: {
            controller: 'reset_password'
          }
        }

      });
  });
