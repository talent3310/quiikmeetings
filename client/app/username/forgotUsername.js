
'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('username', {
        url: '/username',
        templateUrl: 'app/username/forgotusername.html',
        controller: 'usernameCtrl'
      });
  });
