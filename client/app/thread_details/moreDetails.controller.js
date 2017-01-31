'use strict';

angular.module('calendarApp')
  .controller('ThreadMoreDetailsCtrl',['$scope','Bootbox','$state','EventThread', 'reloader', function ($scope, Bootbox, $state, EventThread, reloader) {

    $scope.warning = {
      engagement: "Your engagement is low. This means not enough people are voting.",
      progress: "The progress value semes to have gone down",
      value: "The value of your meetings seems to have gone down",
    };

    $scope.thread_id = $state.params.thread_id;
    $scope.reviews = _.filter(EventThread.reviews, function (review) {
      return review.thread_id === $scope.thread_id;
    });
    $scope.thread = _.find(EventThread.threads, function(thread){
      return thread.id === $scope.thread_id;
    });

    if($scope.thread){
      $scope.events = $scope.thread.events;
      $scope.nextEvent = $scope.thread.firstEvent;
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

    $scope.reloadData = function () {
      window.location.reload ();
    }

    $scope.convertToDate= function (val) {
      var input = {};
      if (val.start) {
        input = val.start;
      }
      var dt = null;
      if (input && input.dateTime) {
        dt = input.dateTime;
      }
      else if (input && input.date) {
        dt = input.date;
      }
      else if (input) {
        dt = input;
      }
      else {
        dt = new Date();
      }

      return new Date(dt);
    }



    var categories = [];

    var dataSeries = [
      {
        name: "Value",
        data: []
      },
      {
        name: "Progress",
        data: []
      },
      {
        name: "Engagement",
        yAxis: 1,
        color: "#d74f9c",
        data: [],
        visible: false,
        tooltip: {
          pointFormat: "<span style=\"color:{point.color}\">\u25CF</span> {point.series.name}: <strong>{point.y:.2f}%</strong> ({point.reviewCount}/{point.emailCount} invitees participated)"
        }
      }
    ];


    // group the review by events
    var groupedList = _.groupBy($scope.reviews, function(item){
      return item.event_id;
    });


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
        var rc = 0, ec = 0;


        if (event.emailCount && event.reviewCount) {
          ec = event.emailCount;
          rc = event.reviewCount;
          dataSeries[2].data.push({
            y: parseFloat(event.reviewCount / event.emailCount) * 100,
            reviewCount: event.reviewCount,
            emailCount: event.emailCount
          });
        }
        else {
          dataSeries[2].data.push({
            y: 0,
            reviewCount: 0,
            emailCount: 0
          });
        }

        dataSeries[0].data.push({
          y: parseFloat(rankSum/groupedList[key].length),
          reviewCount: rc,
          emailCount: ec
        })

        dataSeries[1].data.push({
          y: parseFloat((rankProgressSum/groupedList[key].length)),
          reviewCount: rc,
          emailCount: ec
        });
      }
    });

    var valueItems = _.pluck(dataSeries[0].data, 'y');
    var progressItems = _.pluck(dataSeries[1].data, 'y');
    var engItems = _.pluck(dataSeries[2].data, 'y');

    if(valueItems.length > 1 && progressItems.length > 1) {
      var calculate_change = function (values) {
        var full_avg = _.reduce(values, function(total, n) {
          return total + n;
        }) / values.length;
        var remaining_avg = _.reduce(_.initial(values), function(total, n) {
          return total + n;
        }) / (values.length - 1);

        return full_avg - remaining_avg;
      }

      var calculate_avg = function (values) {
        var full_avg = _.reduce(values, function(total, n) {
          return total + n;
        }) / values.length;

        return full_avg;
      }

      $scope.valueChange = calculate_change (valueItems);
      $scope.valueChangeClass = $scope.valueChange > 0 ? "change-success" : "change-danger";
 	  $scope.valueChangeBg = [$scope.valueChangeClass, $scope.valueChange > 0 ? "bg-success" : "bg-danger"];
      $scope.valueChangeIcon = [$scope.valueChangeClass, $scope.valueChange > 0 ? "fa fa-arrow-circle-up" : "fa fa-arrow-circle-down"]
      
      $scope.progressChange = calculate_change (progressItems);
      $scope.progressChangeClass = $scope.progressChange > 0 ? "change-success" : "change-danger";
      $scope.progressChangeBg = [$scope.progressChangeClass, $scope.progressChange > 0 ? "bg-success" : "bg-danger"];
      $scope.progressChangeIcon = [$scope.progressChangeClass, $scope.progressChange > 0 ? "fa fa-arrow-circle-up" : "fa fa-arrow-circle-down"]

      $scope.avgEng = calculate_avg (engItems);
      $scope.engChange = calculate_change (engItems);
      $scope.engChangeClass = $scope.engChange > 0 ? "change-success" : "change-danger";
      $scope.engChangeBg = [$scope.engChangeClass, $scope.engChange > 0 ? "bg-success" : "bg-danger"];
      $scope.engChangeIcon = [$scope.engChangeClass, $scope.engChange> 0 ? "fa fa-arrow-circle-up" : "fa fa-arrow-circle-down"]


      $scope.meetingBad = $scope.valueChange < 0 || $scope.progressChange < 0;

    }

    $scope.isEventCompleted = function (event) {
      var date = new Date(event.end);

      if (date.getTime () < new Date ().getTime ()) {
        return true
      }
      return false;
    }

    //value and progress chart together
    $scope.categories = categories;

    $scope.chartConfigValue = {
      options: {
        chart: {
          events: {
            load: function(){
              var self = this;
              _.delay (function () {
                if (!self.series[0])
                  return
                var points = self.series[0].points;
                var p2 = self.series[1].points;
                if (points[points.length - 1]) {
                  var p = points[points.length - 1];
                  var px2 = p2[points.length - 1];
                  self.tooltip.refresh ([p, px2]);
                }
              }, 1000)
            }
          },
        },
        tooltip: {
          shared: true,
        },
      },
      title : {
        text : ''
      },
      xAxis: {
      	gridLineWidth: 1,
        tickInterval: 1,
        lineColor: 'black',
        tickmarkPlacement: 'on',
        
        categories: $scope.categories
      },
      yAxis: [{
      	tickInterval: 1,
        lineWidth: 1,
        lineColor: 'black',
        title: {
          text: 'Average'
        },
        min: 0,
        max: 10,
        tickPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }, {
        min: 0,
        max: 100,
        opposite: true,
        
        title: {
          text: "Engagement"
        },
        tickPositions: [0, 20, 40, 60, 80, 100]
      }],
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      series: dataSeries
    };
    
        
    
    Highcharts.theme = {
	  "colors": ["#6d5cae", "#f8d053", "#2980b9", "#d35400", "#2ecc71", "#f1c40f", "#2c3e50", "#7f8c8d"],
	  "chart": {
	    "style": {
	      "fontFamily": "Roboto"
	    }
	  },
	  "title": {
	    "align": "left",
	    "style": {
	      "fontFamily": "Roboto Condensed",
	      "fontWeight": "bold"
	    }
	  },
	  "subtitle": {
	    "align": "left",
	    "style": {
	      "fontFamily": "Roboto Condensed"
	    }
	  },
	  "legend": {
	    "align": "center",
	    "verticalAlign": "bottom"
	  },
	  "xAxis": {
	    "gridLineWidth": 1,
	    "gridLineColor": "#F3F3F3",
	    "lineColor": "#F3F3F3",
	    "minorGridLineColor": "#F3F3F3",
	    "tickColor": "#F3F3F3",
	    "tickWidth": 1
	  },
	  "yAxis": {
	    "gridLineColor": "#F3F3F3",
	    "lineColor": "#F3F3F3",
	    "minorGridLineColor": "#F3F3F3",
	    "tickColor": "#F3F3F3",
	    "tickWidth": 1
	  }
	}


// Apply the theme
Highcharts.setOptions(Highcharts.theme);

    //progress chart all events
    // $scope.chartConfigProgress = {
    //   options: {
    //     chart: {
    //       events: {
    //         load: function(){
    //           var self = this;
    //           _.delay (function () {
    //             if (!self.series[0])
    //               return
    //             var points = self.series[0].points;
    //             if (points[points.length - 1]) {
    //               self.tooltip.refresh (points[points.length - 1]);
    //             }
    //           }, 1000)
    //         }
    //       }
    //     },
    //   },
    //   title : {
    //     text : 'PROGRESS'
    //   },
    //   xAxis: {
    //     categories: $scope.categories
    //   },
    //   yAxis: [{
    //     title: {
    //       text: 'Average'
    //     },
    //     min: 1,
    //     max: 10,
    //     plotLines: [{
    //       value: 0,
    //       width: 1,
    //       color: '#808080'
    //     }]
    //   }, {
    //     min: 0,
    //     max: 100,
    //     opposite: true,
    //     title: {
    //       text: "Engagement"
    //     }
    //   }],
    //   tooltip: {
    //     valueSuffix: '(Avg)'
    //   },
    //   legend: {
    //     layout: 'vertical',
    //     align: 'right',
    //     verticalAlign: 'middle',
    //     borderWidth: 0
    //   },
    //   series: progressSeries
    // };

    $scope.readMore = function () {
      $scope.status = true;
    };
    $scope.showLess = function () {
      $scope.status = false;
    };
    
    

  }]);