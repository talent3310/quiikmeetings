'use strict';

angular.module('calendarApp')
  .controller('ThreadDetailsCtrl',['$scope','Bootbox','$state','EventThread', function ($scope, Bootbox, $state, EventThread) {
    $scope.thread_id = $state.params.thread_id;
    
    $scope.thread = _.find(EventThread.threads, function(thread){
      return thread.id === $scope.thread_id;
    });

    $scope.reviews = _.filter(EventThread.reviews, function(review){
      return review.thread_id === $scope.thread_id;
    });

    if($scope.thread){
      $scope.events = $scope.thread.events;
    }

    console.log('In details vew: reviews : ',$scope.reviews, ' events: ', $scope.events);


    //get average value and progress
    var avg = _.find(EventThread.averages, function(avg){
      return avg.thread_id === $scope.thread_id
    });
    $scope.avgValue = avg ? avg.avgValue : 0;
    $scope.avgProgress = avg ? avg.avgProgress : 0;

    if($scope.reviews && $scope.reviews.length>0){
      $scope.lastValue = $scope.reviews[$scope.reviews.length-1];
    }


    var categories = [];
    var series = [{
      name : 'VALUE ',
      data : []
    },{
      name : 'PROGRESS',
      data: []
    }];


    // group the review by events
    var groupedList = _.groupBy($scope.reviews, function(item){
      return item.event_id;
    });

    console.log('group list: ', groupedList);

    //iterate for each group
    _.each(groupedList, function(group, key){

      var event = _.find($scope.events, function(event){
        //console.log(event.id, key)
        return event.id === key;
      });
      if(event){
        categories.push(moment(event.start).format('YY/DD/MM'));

        var rankSum = 0, rankProgressSum =0;
        _.each(groupedList[key], function(reviewData){
          rankSum = rankSum + reviewData.rank_value; $scope.ranks=rankSum;
          rankProgressSum = rankProgressSum + reviewData.rank_progress;
        });

        series[0].data.push( parseFloat((rankSum/groupedList[key].length).toFixed(2)));
        series[1].data.push( parseFloat((rankProgressSum/groupedList[key].length).toFixed(2)));
      }


    });

    //value and progress chart together
    $scope.categories = categories;
    $scope.series = series;

    $scope.chartConfig = {
      title : {
        text : 'VALUE-PROGRESS'
      },
      xAxis: {
        categories: $scope.categories
      },
      yAxis: {
        title: {
          text: 'Average'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        valueSuffix: '(Avg)'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      series: $scope.series
    };

  }]);
