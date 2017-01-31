/**
 * Created by sohel on 4/30/15.
 */
'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('add-user', {
        url: '/add-user',
        templateUrl: 'app/user/add_user.html',
        controller: 'UserCtrl'
      })
      .state('new-user', {
        url: '/new-user',
        templateUrl: 'app/user/add_user.html',
        controller: 'UserCtrl'
      })
      .state('user-list', {
        url: '/user-list',
        templateUrl: 'app/admin/users.html',
        controller: 'AdminCtrl'
      })
      .state('add-user-availability', {
        url: '/add-user-availability',
        templateUrl: 'app/user/availability.html',
        controller: 'AvailabilityCtrl'
      });
  });