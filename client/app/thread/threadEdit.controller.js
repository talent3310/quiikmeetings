'use strict';
angular.module('calendarApp')
    .controller('ThreadEditCtrl', ['Cronofy', '$scope', 'ngToast', '$state', 'Bootbox', '$location', '$timeout', 'Auth', 'GoogleCalendar', 'EventThread', 'User', 'Review', 'Event',
        function(Cronofy, $scope, ngToast, $state, Bootbox, $location, $timeout, Auth, GoogleCalendar, EventThread, User, Review, Event) {
            // Misc scope for 
            $scope.mode = 0;

            // State variables for the UI
            // 
            $scope.searchView = {
                sdr: {
                    startDate: moment().subtract(15, 'days'),
                    endDate: moment().add(15, 'days')
                },
                results: []
            };

            $scope.dpOptions = {};

            $scope.threadView = {
                items: [],
                fields: {
                    name: "",
                    meeting_purpose: "",
                    reason: "",
                    meeting_type: "Sales",
                    comment_type: "Enable"
                },
                notification: null
            };

            $scope.currentThread = {
                id: null
            };

            $scope.user = {};
            $scope.user = Auth.getCurrentUser();
 
            // 
            // UI functions: Search
            // 
            $scope.updateDateRange = function() {
                var sdr = $scope.searchView.sdr;
                if (sdr.startDate !== undefined && sdr.endDate !== undefined && sdr.startDate !== '' && sdr.endDate !== '') {
                    // convert date from and date to in ISO string format. Google calender accept min and max time in ISO format
                    var dateFrom = sdr.startDate.toISOString();
                    var dateTo = sdr.endDate.toISOString();
                    $scope.threadView.googleLoading = true;
                    Cronofy.getEvents(dateFrom, dateTo, function(error, response) {
                        if (error) {
                            ngToast.create("Something went wrong while fetching calendar events");
                        } else {
                            console.log("Cronofy calendar returned", response);
                            if(response.success){
                                $scope.threadView.googleLoading = false;
                                $scope.searchView.results = response.data;
                            } else {
                                ngToast.create("Something went wrong while fetching calendar events");
                            }
                        }
                    });
                }
            };

            $scope.selectSearchItem = function(index) {
                $scope.searchView.results[index].selectedFlag = !$scope.searchView.results[index].selectedFlag;
            };

            $scope.addSearchResults = function() {
                var selected = _.filter($scope.searchView.results, { 'selectedFlag': true });
                var existing_ids = _.pluck($scope.threadView.items, 'id');
                var filtered_selected = _.filter(selected, function(val) {
                    return !_.contains(existing_ids, val.id);
                });
                $scope.threadView.items = $scope.threadView.items.concat(filtered_selected);
                $scope.mode = 1;
                $scope.searchView.results = [];
            };

            // 
            // Thread View
            // 
            $scope.saveThread_1 = function() {
                alert('create a new push notifcation!');
                Cronofy.createPushNotification(function(err, resp){

                });
            }

            $scope.saveThread = function() {
                // the parameters the server expects in order to create a new event.
                // 
                var saveParams = {
                    events: _.map($scope.threadView.items, function(event) {
                        return {
                            id: event.event_uid,
                            summary: event.summary,
                            calendar_id: event.calendar_id,

                            // Nested Teritiary 
                            start: event.start.dateTime ? event.start.dateTime : (event.start.date ? event.start.date : event.start),
                            end: event.end.dateTime ? event.end.dateTime : (event.start.date ? event.start.date : event.end),
                            participants: event.attendees ? event.attendees : []
                        };
                    }),
                    user_id: $scope.user._id,
                    from_google_event: true,
                    name: $scope.threadView.fields.name,
                    meeting_purpose: $scope.threadView.fields.meeting_purpose,
                    reason: $scope.threadView.fields.reason,
                    meeting_type: $scope.threadView.fields.meeting_type,
                    comment_type: $scope.threadView.fields.comment_type
                };
                var action = "created";


                if ($scope.currentThread.id !== null) {
                    action = "updated";
                    saveParams.id = $scope.currentThread.id;
                    saveParams._id = $scope.currentThread.id;
                }

                EventThread.saveThread(saveParams)
                    .then(function(response) {
                        $scope.threadView.notification = "Your thread has been " + action + ".";
                        $scope.currentThread.id = response._id;
                    })
            };

            $scope.removeItem = function(index) {
                $scope.threadView.items.splice(index, 1);
            }


            $scope.showAddMeeting = function() {
                $scope.mode = 0;
                $scope.updateDateRange();
            };

            $scope.isInPast = function(input) {
                var dt = null;
                if (input && input.dateTime) {
                    dt = input.dateTime;
                } else if (input && input.date) {
                    dt = input.date;
                } else if (input) {
                    dt = input;
                } else {
                    dt = new Date();
                }

                return moment(dt).isBefore(moment())
            }

            $scope.convertToDate = function(val) {
                var input = {};
                if (val.start) {
                    input = val.start;
                }
                var dt = null;
                if (input && input.dateTime) {
                    dt = input.dateTime;
                } else if (input && input.date) {
                    dt = input.date;
                } else if (input) {
                    dt = input;
                } else {
                    dt = new Date();
                }

                return new Date(dt);
            }

            /**
             * Load the thread from a list into the current UI
             */
            $scope.loadThread = function(threadList) {
                var threadObj = _.find(EventThread.threads, function(item) {
                    return item.id === $scope.currentThread.id || item._id === $scope.currentThread.id;
                });
                console.log("Editing the thread", threadObj);

                $scope.currentThread = threadObj;

                // Don't mutate the currentThread obj. let's just keep it around for future reference
                $scope.threadView.items = threadObj.events;
                $scope.threadView.fields.name = threadObj.name;
                $scope.threadView.fields.meeting_purpose = threadObj.meeting_purpose;
                $scope.threadView.fields.reason = threadObj.reason;
                $scope.threadView.fields.meeting_type = threadObj.meeting_type;
                $scope.threadView.fields.comment_type = threadObj.comment_type;
            };

            // Initialize the state
            if ($state.params.type === 'cronofy' && $state.params.create) {
                $scope.mode = 0;
                $scope.updateDateRange();
            } else if ($state.params.edit) {
                $scope.mode = 1;
                $scope.currentThread.id = $state.params.thread_id;
                if (typeof(EventThread.threads) !== 'undefined') {
                    $scope.loadThread(EventThread.threads);
                } else {
                    EventThread.getThreads(function(err, response) {
                        if (!err) {
                            EventThread.setThreads(response);

                            $scope.loadThread(EventThread.threads);
                        } else {
                            console.warn("Error getting threads");
                        }
                    })
                }
            }
        }
    ])
    .filter('friendlyDate', function() {
        return function(input) {
            var dt = null;
            if (input && input.dateTime) {
                dt = input.dateTime;
            } else if (input && input.date) {
                dt = input.date;
            } else if (input) {
                dt = input;
            } else {
                dt = new Date();
            }

            return moment(dt).format("dddd, Do MMM");
        }
    })
    .filter('friendlyAgo', function() {
        return function(input) {
            var dt = null;
            if (input && input.dateTime) {
                dt = input.dateTime;
            } else if (input && input.date) {
                dt = input.date;
            } else if (input) {
                dt = input;
            } else {
                dt = new Date();
            }

            return moment(dt).fromNow();
        }
    })
    .filter('nameList', function() {
        return function(input) {
            if (input.attendees) {
                input = input.attendees;
            }
            if (input.participants) {
                input = input.participants;
            }
            var format_name = function(item) {
                return item.displayName ? item.displayName : item.email;
            };
            if (input && input.length) {
                var result = "";
                var others = input.length > 3;

                if (others) {
                    var displayed = _.map(_.take(input, 3), format_name);
                    var displayed_commas = displayed.join(", ");

                    result += displayed_commas;
                    result += " and " + (input.length - 3).toString() + " others.";
                } else {
                    var commad = _.map(_.initial(input), format_name);

                    if (commad.length === 1) {
                        result += commad[0];
                    } else {
                        result += commad.join(", ");
                    }

                    result += " and " + format_name(_.last(input));
                }

                return result;
            } else {
                return "No Participants";
            }
        }
    })
    .filter('formatDuration', function() {
        return function(input) {
            if (!input) {
                return "No Input";
            }
            if (!input.start) {
                return "No start";
            }
            if (input.start.date) {
                return "Whole Day";
            } else if (input.start.dateTime) {
                return moment(input.start.dateTime).format("hh:mm A") + " to " + moment(input.end.dateTime).format("hh:mm A");
            } else if (input.start) {
                return moment(input.start).format("hh:mm A") + " to " + moment(input.end).format("hh:mm A");
            }
        }
    });
