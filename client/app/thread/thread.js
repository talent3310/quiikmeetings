'use strict';

angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('thread-new-cronofy', {
        url: '/threads/add/cronofy',
        templateUrl: 'app/thread/threadEdit.html',
        controller: 'ThreadEditCtrl',
        params: {
          type: 'cronofy',
          edit: false,
          create: true
        }
      })
      .state('thread-edit', {
        url: '/threads/edit/:thread_id',
        templateUrl: 'app/thread/threadEdit.html',
        controller: 'ThreadEditCtrl',
        params: {
          edit: true,
          create: false
        }
      })
      .state('thread-list', {
        url: '/threads/',
        templateUrl: 'app/thread/threadList.html',
        controller: 'ThreadListCtrl',
        resolve: {
          reloader: 'ReloadHelper'
        }
      })
  });