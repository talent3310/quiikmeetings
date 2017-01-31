'use strict';

angular.module('calendarApp')
    .controller('EventDetailsCtrl', ['$scope', 'Bootbox', '$state', 'EventThread', 'GoogleCalendar', 'GoogleEvent', 'Event', 'reloader', function($scope, Bootbox, $state, EventThread, GoogleCalendar, GoogleEvent, Event, reloader) {
        $scope.thread_id = $state.params.thread_id;
        $scope.event_id = $state.params.event_id;

        $scope.reviews = _.filter(EventThread.reviews, function(review) {
            return (review.thread_id === $scope.thread_id && review.event_id === $scope.event_id);
        });

        $scope.thread = _.find(EventThread.threads, function(thread) {
            return thread.id === $scope.thread_id;
        });

        if ($scope.thread) {
            $scope.event = _.find($scope.thread.events, function(event) {
                return event.id === $scope.event_id;
            });
            console.log('$scope.thread.events===> ', $scope.thread.events);
            console.log('scope event-> ', $scope.event);
            $scope.startTime = new Date($scope.event.start).getTime();
            $scope.endTime = new Date($scope.event.end).getTime();
        }

        console.log('In details vew: reviews : ', $scope.reviews, ' event: ', $scope.event);


        //get average value and progress
        var avg = _.find(EventThread.averages, function(avg) {
            return avg.thread_id === $scope.thread_id
        });
        $scope.avgValue = avg ? avg.avgValue : 0;
        $scope.avgProgress = avg ? avg.avgProgress : 0;
        $scope.avgEng = 0;
        if ($scope.event.reviewCount && $scope.event.emailCount) {
            $scope.avgEng = $scope.event.reviewCount / $scope.event.emailCount;
        }


        var valueSeries = [{
            name: 'VALUE ',
            data: []
        }];

        var progressSeries = [{
            name: 'PROGRESS',
            data: []
        }];


        // group the review by events
        var groupedList = _.groupBy($scope.reviews, function(item) {
            return item.event_id;
        });


        //iterate for each group
        var valueSum = 0;
        var progressSum = 0;
        _.each(groupedList, function(group, key) {
            if ($scope.event) {
                _.each(groupedList[key], function(reviewData) {
                    valueSum = valueSum + reviewData.rank_value;
                    progressSum = progressSum + reviewData.rank_progress;
                    valueSeries[0].data.push([moment($scope.event.start).unix() * 1000, reviewData.rank_value]);
                    progressSeries[0].data.push([moment($scope.event.start).unix() * 1000, reviewData.rank_progress]);
                });
            }
        });

        $scope.eventValueAvg = $scope.reviews.length === 0 ? 0 : (valueSum / $scope.reviews.length).toFixed(2);
        $scope.eventProgressAvg = $scope.reviews.length === 0 ? 0 : (progressSum / $scope.reviews.length).toFixed(2);

        $scope.chartConfigValue = {
            title: {
                text: 'VALUE'
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
            series: valueSeries
        };

        $scope.chartConfigProgress = {
            title: {
                text: 'PROGRESS'
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
            series: progressSeries
        };


        $scope.readMore = function() {
            $scope.status = true;
        };
        $scope.showLess = function() {
            $scope.status = false;
        };

        if ($scope.event.google_event) {
            GoogleCalendar.getSelectedEvent($scope.event_id, function(err, data) {
                if (!err && !data.err) {
                    GoogleEvent.setEventData(data);
                    $scope.attendees = data.attendees.length;
                    $scope.weighedIn = $scope.reviews.length;
                }
                console.log('Event Details : ', data);
            });
        } else {
            Event.getAttendees($scope.event_id, function(err, data) {
                if (!err && !data.err) {
                    $scope.weighedIn = $scope.reviews.length;
                    if (data.attendees) {
                        $scope.attendees = data.attendees.length;
                    }
                }
            });
        }

        $scope.reloadData = function() {
            window.location.reload();
        }
    }]);
