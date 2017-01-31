'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('root', {
        url: '/',
        templateUrl: 'app/home/main.html',
        controller: 'MainCtrl'
      });
  });