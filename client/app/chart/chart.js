angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('chart', {
        url: '/chart/:thread_id/:chart_type',
        templateUrl: 'app/chart/chart.html',
        controller: 'ChartCtrl'
      });
  });