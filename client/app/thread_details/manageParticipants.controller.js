/**
 * Created by sohel on 10/10/15.
 */

angular.module('calendarApp')
    .controller('ManageParticipantsCtrl', ['Cronofy', '$scope', 'Bootbox', '$state', 'EventThread', 'GoogleCalendar', 'GoogleEvent', 'Review', 'Event', 'reloader',
        function(Cronofy, $scope, Bootbox, $state, EventThread, GoogleCalendar, GoogleEvent, Review, Event, reloader) {
            $scope.thread_id = $state.params.thread_id;
            $scope.event_id = $state.params.event_id;
            $scope.attendees = [];

            $scope.readMore = function() {
                $scope.status = true;
            };
            $scope.showLess = function() {
                $scope.status = false;
            };

            //filter out the reviews for this event
            $scope.reviews = _.filter(EventThread.reviews, function(review) {
                return (review.thread_id === $scope.thread_id && review.event_id === $scope.event_id);
            });

            //filter out the thread
            $scope.thread = _.find(EventThread.threads, function(thread) {
                return thread.id === $scope.thread_id;
            });
            //filter out the event
            if ($scope.thread) {
                $scope.event = _.find($scope.thread.events, function(event) {
                    return event.id === $scope.event_id;
                });
            }
            $scope.weighedIn = $scope.reviews.length;

            //load attendee list from google if it is a google event
            function loadAttendeesFromCronofy() {
                Cronofy.getSelectedEvent($scope.event_id, function(err, data) {
                    if (!err && !data.err) {
                        GoogleEvent.setEventData(data[0]);
                        // there is only a event have uid, so assign 0 element
                        $scope.event = data[0];

                        var tempAttendees = [];
                        console.log('attendees Details : ', data);
                        _.each(data[0].attendees, function(attendee) {
                            var reviewed = _.find($scope.reviews, function(review) {
                                return review.user_email === attendee.email;
                            });
                            attendee.reviewed = reviewed ? true : false;
                            tempAttendees.push(attendee);
                        });
                        $scope.attendees = tempAttendees;
                    }
                    
                });
            } 
            Event.getAttendees($scope.event_id, function(err, data) {
                
                if (!err && !data.err) {
                    $scope.weighedIn = $scope.reviews.length;

                    var tempAttendees = [];
                    _.each(data.attendees, function(attendee) {
                        var reviewed = _.find($scope.reviews, function(review) {
                            return review.user_email === attendee.email;
                        });
                        attendee.reviewed = reviewed ? true : false;
                        tempAttendees.push(attendee);
                    });
                    $scope.attendees = tempAttendees;
                }
                //load google participants if not already loaded
                if ($scope.thread && $scope.thread.from_google_event && $scope.attendees.length === 0) {
                    loadAttendeesFromCronofy();
                }
            });
            console.log('In details vew: reviews : ', $scope.reviews, ' event: ', $scope.event);

            //get average value and progress
            var avg = _.find(EventThread.averages, function(avg) {
                return avg.thread_id === $scope.thread_id
            });
            $scope.avgValue = avg ? avg.avgValue : 0;
            $scope.avgProgress = avg ? avg.avgProgress : 0;


            // group the review by events
            var groupedList = _.groupBy($scope.reviews, function(item) {
                return item.event_id;
            });


            //iterate for each group and find the sum
            var valueSum = 0;
            var progressSum = 0;
            _.each(groupedList, function(group, key) {
                if ($scope.event) {
                    _.each(groupedList[key], function(reviewData) {
                        valueSum = valueSum + reviewData.rank_value;
                        progressSum = progressSum + reviewData.rank_progress;
                    });
                }
            });

            $scope.eventValueAvg = $scope.reviews.length === 0 ? 0 : (valueSum / $scope.reviews.length).toFixed(2);
            $scope.eventProgressAvg = $scope.reviews.length === 0 ? 0 : (progressSum / $scope.reviews.length).toFixed(2);


            $scope.reviewLinkList = [];

            /**
             * handler for creating review email list
             * @param $event
             * @param $index
             * @param selectUser
             */
            $scope.selectUser = function($event, $index, selectUser) {
                var checkbox = $event.target;
                if (checkbox.checked) {

                    var attendee = _.find($scope.attendees, function(attendee) {
                        return attendee.email === selectUser;
                    });
                    $scope.reviewLinkList.push({
                        email: selectUser,
                        name: attendee.displayName
                    });

                    console.log('reviewLinkList', $index, $scope.reviewLinkList);
                } else {
                    $scope.reviewLinkList.splice($index, 1);
                    console.log('reviewLinkList_delete', $index, $scope.reviewLinkList);
                }
            };

            /**
             * send the user list for review email
             */
            $scope.sendReviewLink = function() {
                console.log('sending reviews=> ', $scope.reviewLinkList);
                Review.sendReviewLink($scope.reviewLinkList, $scope.thread_id, $scope.event_id, $scope.event.summary)
                    .then(function(response) {
                        $scope.reviewLinkList = [];
                        if (response.emailSent) {
                            var msg = 'E-mail has been sent!';
                            Bootbox.showAlert(msg);
                        } else if (response.error) {
                            Bootbox.showAlert(response.error);
                        }
                    })
                    .catch(function(err) {
                        $scope.errors = {};
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.message;
                        });
                    });
            };

            /**
             * save participants
             * @type {{}}
             */
            $scope.participants = {};
            $scope.saveParticipants = function(form) {
                if (form.$valid) {
                    //check if the partcipant
                    var attendees = $scope.attendees;
                    attendees.push({
                        displayName: $scope.newAttendee.displayName,
                        email: $scope.newAttendee.email,
                        responseStatus: "needsAction",
                        reviewed: false,
                        fromApp: true
                    });

                    Event.saveParticipants(attendees, $scope.event_id)
                        .then(function(response) {
                            $scope.newAttendee.displayName = '';
                            $scope.newAttendee.email = '';

                            if (!response.error) {
                                $scope.attendees = response.attendees;
                                var msg = 'Participant has been added!';
                                Bootbox.showAlert(msg);
                            } else if (response.error) {
                                Bootbox.showAlert(response.error);
                            }
                        })
                        .catch(function(err) {
                            $scope.errors = {};
                            angular.forEach(err.errors, function(error, field) {
                                form[field].$setValidity('mongoose', false);
                                $scope.errors[field] = error.message;
                            });
                        });
                }
            }
        }
    ]);
