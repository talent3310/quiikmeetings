'use strict';

angular.module('calendarApp')
  .controller('ChartCtrl',['$scope','$state','Review', function ($scope, $state, Review) {
    var thread_id = $state.params.thread_id;
    var chartType = $state.params.chart_type;

    var dataSet = [];
    var dataCount = [];
    /**
     * get the chart items and count the occurrence of rankValue
     */

    Review.getReviews(thread_id, function(error, response){
      if(!error){

        //group the review by events
        var groupedList = _.groupBy(response.reviews, function(item){
          return item.event_id;
        });

        console.log(groupedList);

        var categories = [];
        var series = [{
          name : 'VALUE ',
          data : []
        },{
          name : 'PROGRESS',
          data: []
        }];


        //iterate for each group
        _.each(groupedList, function(group, key){

          //find the the event data
          var event = _.find(response.events, function(event){
            //console.log(event.id, key)
            return event.id === key;
          });
          //console.log()
          categories.push(moment(event.start).format('YYYY-DD-MM HH:mm:ss'));

          if(chartType === 'scatter'){
            _.each(groupedList[key], function(reviewData){

              var event = _.find(response.events, function(event){
                //console.log(event.id, key)
                return event.id === reviewData.event_id;
              });

              series[0].data.push([ moment(event.start).unix()*1000,reviewData.rank_value]);
              series[1].data.push([ moment(event.start).unix()*1000,reviewData.rank_progress]);
            });

          }
          else{
            var rankSum = 0, rankProgressSum =0;
            _.each(groupedList[key], function(reviewData){
              rankSum = rankSum + reviewData.rank_value;
              rankProgressSum = rankProgressSum + reviewData.rank_progress;
            });

            series[0].data.push( parseFloat((rankSum/groupedList[key].length).toFixed(2)));
            series[1].data.push( parseFloat((rankProgressSum/groupedList[key].length).toFixed(2)) );
          }


          //count ++;
        });

        $scope.categories = categories;
        $scope.series = series;

        console.log($scope.categories, $scope.series);

        if(chartType === 'scatter'){
          $scope.series[0].name = 'value';
          $scope.series[0].type = 'scatter';
          $scope.series[0].marker = {
            radius : 4
          };

          $scope.series[1].name = 'progress';
          $scope.series[1].type = 'scatter';
          $scope.series[1].marker = {
            radius : 4
          };


          $scope.chartConfig = {
            title : {
              text : 'VALUE-PROGRESS'
            },

            chart: {
              type: 'scatter',
              zoomType: 'xy'
            },
            xAxis: [{
              "type": "datetime",
              
              title: {
                enabled: true,
                text: 'Dates'
              },
              "labels": {
                "formatter": function() {
                  return Highcharts.dateFormat("%b %e %Y", this.value)
                }
              }
            }],
            yAxis: {
            	
              title: {
                text: 'Value'
              }
            },
            legend: {
              layout: 'vertical',
              align: 'left',
              verticalAlign: 'top',
              x: 100,
              y: 70,
              floating: true,
              borderWidth: 1
            },
            series: $scope.series
          };
        }
        else{
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
        }

      }
    });


  }]);