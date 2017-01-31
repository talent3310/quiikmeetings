/**
 * Created by David on 12/14/16.
 */

'use strict';

module.exports = function() {

    var credentials = require('../config/cronofy_client_secret.json');
    var User = require('../schemas/UserSchema');
    var cronofy = require('cronofy');
    var EventThread = require('../models/eventThread')();
    var Participant = require('../models/participant')();
    var _ = require('lodash');

    return { 

        /**
         * get auth url
         * @param req, request param from express
         * @param res, response param from express
         */
        getAuthUrl: function(req, res) {
            var authUrl = credentials.request_authorization + "&client_id=" + credentials.client_id + "&redirect_uri=" + credentials.redirect_uri + "&scope=" + credentials.scope;
            res.send(authUrl);
        },

        /**
         * saves the authorization token to db
         * @param req
         * @param res
         */
        saveToken: function(req, res) {
            // get token
            var options = {
                client_id: credentials.client_id,
                client_secret: credentials.client_secret,
                grant_type: 'authorization_code',
                code: req.body.auth_code,
                redirect_uri: credentials.redirect_uri
            };
            cronofy.requestAccessToken(options, function(err, response) {
                if (err) {
                    console.log('saveToken error ==> ', err);
                    res.send({ success: false});
                }
                else 
                    User.findById(req.user._id, function(err, user) {
                        if (!err) {
                            user.cronofy_auth_token = response.access_token;
                            user.refresh_token = response.refresh_token;
                            var profileId = response.linking_profile.profile_id;
                            //get calendar_id
                            var optionsNoti = {
                                access_token: user.cronofy_auth_token,
                                callback_url: credentials.pushNotiCallbackUrl
                            }
                            cronofy.createNotificationChannel(optionsNoti, function(err, response) {
                                if (err) console.log(err);
                                console.log("===============> ", response);
                                user.channelId = response.channel.channel_id;

                                var options = {
                                    "access_token": user.cronofy_auth_token
                                }
                                cronofy.listCalendars(options, function(err, resp) {
                                    if (err) {
                                        console.log('list calendars error! => ', err);
                                        throw err;
                                    }
                                    console.log('resp=> ', resp);

                                    var selectedCalendars = _.find(resp.calendars, function(obj) {
                                        return obj.profile_id === profileId;
                                    });

                                    user.calendar_id = selectedCalendars.calendar_id;
                                    console.log('selectedCalendarsId=> ', selectedCalendars.calendar_id);
                                    user.save();
                                    res.send({ success: true, token: response.access_token });
                                });
                            });


                        } else {
                            res.send({ success: false, token: response.access_token });
                        }
                    });
            });
        },
        /**
         * saves the authorization token to db
         * @param req
         * @param res
         */
        refreshToken: function(req, res) {
            User.findById(req.user._id, function(err, user) {
                if (!err) {

                    var options = {
                        client_id: credentials.client_id,
                        client_secret: credentials.client_secret,
                        grant_type: "refresh_token",
                        refresh_token: user.refresh_token
                    }
                    cronofy.refreshAccessToken(options, function(err, resp) {
                        if (!err) {
                            user.cronofy_auth_token = resp.access_token;
                            user.refresh_token = resp.refresh_token;
                            user.save();
                            res.send({ success: true, token: resp.access_token });
                        } else {
                            console.log(err);
                        }

                    });
                } else {
                    console.log(err);
                }
            });
        },
        /**
         * get all events from google calender
         * now maximum no of events 25000
         * it will return 25000 events within date range
         * @param req
         * @param res
         */
        getEvents: function(req, res) {

            // set date range from req params
            var dateFrom = req.params.date_from;
            var dateTo = req.params.date_to;

            User.findById(req.user._id, function(err, user) {
                if (!err) {
                    var options = {
                        access_token: user.cronofy_auth_token,
                        from: dateFrom,
                        to: dateTo,
                        tzid: "Etc/UTC"
                    };
                    console.log('access_token=> ', user.cronofy_auth_token);
                    cronofy.readEvents(options, function(err, response) { 
                        if (err) {
                            console.log('error-> ', err);
                            res.send({success: false,data: null});
                        } else{
                            var eventsResponse = _.filter(response.events, function(obj) {
                            return obj.calendar_id === user.calendar_id;
                            });
                            console.log('eventsResponse=> ', eventsResponse);
                            res.send({success: true,data: eventsResponse});
                        }
                        
                    });
                } else {
                    var respTempVar = {
                        success: false,
                        data: null
                    }
                    res.send({success: false,data: null});
                }
            });


        },
        /**
         * get an selected event from cronofy calender
         * @param req
         * @param res
         */
        getSelectedEvent: function(req, res) {
            var eventId = req.params.eventId;
            User.findById(req.user._id, function(err, user) {

                if (err) console.log(err);
                if (!err) {
                    var options = {
                        access_token: user.cronofy_auth_token,
                        tzid: "Etc/UTC"
                    };

                    cronofy.readEvents(options, function(err, response) {
                        console.log('error-> ', err);
                        if (err) throw err;
                        console.log('response is ==> ', response);

                        var eventsResponse = _.filter(response.events, function(obj) {
                            return obj.calendar_id === user.calendar_id && obj.event_uid === eventId;
                        });
                        console.log('selected event=> ', eventsResponse);
                        res.send(eventsResponse);
                    });
                }
            });
        },
        /**
         * create a push notification 
         * @param req
         * @param res
         */
        createPushNotification: function(req, res) {

            User.findById(req.user._id, function(err, user) {
                if (!err) {
                    var options = {
                        access_token: user.cronofy_auth_token,
                        callback_url: credentials.pushNotiCallbackUrl
                    }
                    cronofy.createNotificationChannel(options, function(err, response) {
                        if (err) throw err;
                        console.log("createPushNotification response======> ", response);
                        response.send('success');
                    });

                }
            });

        },
        /**
         * get the specified reads when recieve the notification - removed, changed
         * @param req
         * @param res
         */
        notification: function(req, res) {
            var lastModifiedTime = req.body.notification.changes_since;
            var notificationType = req.body.notification.type;
            var channelId = req.body.channel.channel_id;
            var accessToken;
            console.log('recieved notification');
            res.send("Hey Cronofy!, Hear me, Success! Wow! Wow! Wow!");
            User.findOne({ channelId: channelId }).exec(function(err, user) {
                if (err) {
                    console.log(err);
                } else if(user) {

                    console.log('user=> ', user);
                    accessToken = user.cronofy_auth_token;
                    if (notificationType == 'change') {
                        console.log('change notification recieve');
                        var options = {
                            access_token: accessToken,
                            include_deleted: true,
                            last_modified: lastModifiedTime,
                            tzid: "Etc/UTC"
                        };
                        cronofy.readEvents(options, function(err, response) {
                            
                            if (err) console.log('get last_modified event error!', err);
                            var changedEvents = response.events;
                            console.log('changedEvents-----------> ', response);
                            for (var i = 0; i < response.events.length; i++) {
                                // specified event was removed
                                if (changedEvents[i].deleted == true) {
                                    console.log('deleted events');
                                    // remove from created threads 
                                    var deletedEventId = changedEvents[i].event_uid;
                                    EventThread.getThreadHaveSpecifiedEventId(deletedEventId, function(err, threads) {
                                        if (err) console.log(err);
                                        else {
                                            for (var j = 0; j < threads.length; j++) {
                                                var toDoEvents = threads[j].events;

                                                var tempEvents = [];
                                                for (var k = 0; k < toDoEvents.length; k++) {
                                                    if (toDoEvents[k].id != deletedEventId)
                                                        tempEvents.push(toDoEvents[k]);
                                                }
                                                threads[j].events = tempEvents;
                                                EventThread.update(threads[j], function(err, resp) {
                                                    if (err) console.log(err);
                                                    console.log('eventThread updated for deleted event');
                                                });
                                            }
                                        }
                                    });
                                    Participant.deleteParticipants(deletedEventId, function(err) {
                                        if (err) console.log(err);
                                    });
                                   
                                } else { // specified event was changed-summary, date 
                                    var changedEventId = changedEvents[i].event_uid;
                                    var changedEvent = changedEvents[i];
                                    console.log('changedEvent', changedEvent);
                                    //eventthread update
                                    EventThread.getThreadHaveSpecifiedEventId(changedEventId, function(err, threads) {
                                        if (err) console.log(err);
                                        else {
                                            for (var j = 0; j < threads.length; j++) {
                                                for (var k = 0; k < threads[j].events.length; k++) {
                                                    if (threads[j].events[k].id == changedEventId) {
                                                        console.log('specified event changed', changedEventId);
                                                        threads[j].events[k].participants = changedEvent.attendees;
                                                        threads[j].events[k].end = changedEvent.end;
                                                        threads[j].events[k].start = changedEvent.start;
                                                        threads[j].events[k].calendar_id = changedEvent.calendar_id;
                                                        threads[j].events[k].summary = changedEvent.summary;
                                                    }
                                                }
                                                EventThread.update(threads[j], function(err, resp) {
                                                    if (err) console.log(err);
                                                    console.log('eventThread updated for changed evnet');
                                                })
                                            }
                                        }
                                    });
                                    //participants update
                                    Participant.getParticipants(changedEventId, function(err, participant) {

                                        if (err) console.log(err);
                                        else if (participant) {
                                            var tempChangedEventAttendees = []; //changedEvent.attendees;
                                            var attendees = [];
                                            if (participant) attendees = participant.attendees;
                                            var fromAppAttendees = [];
                                            for (var kp = 0; kp < attendees.length; kp++) {
                                                if (attendees[kp].fromApp)
                                                    tempChangedEventAttendees.push(attendees[kp]);
                                            }
                                            for (var hp = 0; hp < changedEvent.attendees.length; hp++) {
                                                var temp = {}
                                                temp.displayName = changedEvent.attendees[hp].display_name;
                                                temp.email = changedEvent.attendees[hp].email;
                                                temp.responseStatus = changedEvent.attendees[hp].status;
                                                temp.reviewed = false;
                                                temp.fromApp = false;
                                                tempChangedEventAttendees.push(temp);
                                            }
                                            participant.attendees = tempChangedEventAttendees;
                                            Participant.update(participant, function(err, resp) {
                                                if (err) console.log(err);
                                                console.log('participants updated for changed evnet');
                                            })

                                        }
                                    });
                                  
                                }//
                            }
                        });
                    }

                }
            });

        }
    }
};
