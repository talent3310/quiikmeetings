'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('password', {
        url: '/password',
        templateUrl: 'app/password/forgotPassword.html',
        controller: 'PasswordCtrl'
      });
  });