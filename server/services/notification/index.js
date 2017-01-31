/**
 * User: David
 * Date: 1/23/17
 */

module.exports = function() {
    var EventThread = require('../../models/eventThread')();
    var User = require('../../models/user')();
    var emailSender = require('../email/email.sender')();

    var intervalTime = 1; // minutes
    var cron = setInterval(function(str1, str2) {
        console.log('---------------------schedule-------------------');
        EventThread.getAllThreads(function(err, threads) {
            if (err) console.log('cron-error=> ', err);
            else {
                var threads_length = threads.length;
                for (var i = 0; i < threads_length; i++) {
                    var user_id = threads[i].user_id;
                    var events = threads[i].events;
                    // console.log('events=> ', events);
                    sendNotification(user_id, events);
                }
            }
        });
    }, intervalTime * 60 * 1000, "Hello.", "How are you?");

    function parseDate(input) { //2017-01-09, 2017-01-09T15:00:00Z
        if (input.length == 10) {
            var parts = input.split('-');
            // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
            return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
        } else {
            var parts = input.slice(0, 10).split('-');
            var parts2 = input.slice(11, 19).split(':');
            // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
            return new Date(parts[0], parts[1] - 1, parts[2], parts2[0], parts2[1], parts2[2]); // Note: months are 0-based
        }

    }

    function dateToTimestamp(input) {
        return Math.round(input.getTime() / 1000); // seconds
    }

    function sendNotification(user_id, events) {
        User.getUserByID(user_id, function(err, user) {
            if (err) console.log('cron_get_user_error ==> ', err);
            else {
                // console.log('cron_get_user_success ==> ', user);
                // user.name,user.notification_setBefore, user.notification_setAfter, user.notification_recieve
                var user_name = user.name;
                var user_email = user.email;
                var notification_setBefore = 5 //minutes, notification_setBefore * 60 from db
                var notification_setAfter = 3 //minutes, notification_setAfter * 60 from db
                var notification_recieve = true;

                if (notification_recieve) {
                    var current_timestamp = Math.round(new Date().getTime() / 1000);
                    // console.log('current_timestamp ==> ', current_timestamp);
                    for (var j = 0; j < events.length; j++) {
                        var event_start_date = parseDate(events[j].start);
                        var event_start_timestamp = dateToTimestamp(event_start_date);
                        var event_end_date = parseDate(events[j].end);
                        var event_end_timestamp = dateToTimestamp(event_end_date);
                        var event_title = events[j].summary;
                        var event_participants = events[j].participants; //obj
                        var subStart = (event_start_timestamp - current_timestamp) / 60; //minutes
                        var subEnd = (current_timestamp - event_end_timestamp) / 60; //minutes

                        //send notification before meeting
                        console.log('subStart=> ', subStart);
                        console.log('subEnd=> ', subEnd);
                        if (subStart >= notification_setBefore && subStart < (notification_setBefore + intervalTime)) {
                            //send notification
                            console.log('send notification before meeting==> ',
                                ' email:', user_email,
                                ' name:', user_name,
                                ' title:', event_title,
                                ' participants:', event_participants,
                                ' start:', event_start_date,
                                ' end:', event_end_date,
                                ' before:', notification_setBefore,
                                ' after:', notification_setAfter);

                            var participants = "";
                            for (var k = 0; k < event_participants.length; k++) {
                                participants = participants + "<b>" + event_participants[k].email + "</b><br/>";
                            }
                            var html = "Hello <b>" + user_name + "</b>," +
                                "<br><br> Your meeting <b>" + event_title + "</b> that you’ve requested be measured is scheduled for " +
                                notification_setBefore + "minutes from now. <br/><br/>Here are the people currently invited to the meeting: <br/><br/>" +
                                participants;

                            var subject = "Hello";
                            emailSender.sendEmail(user_email, html, html, subject);
                        }
                        //send notification after meeting
                        if (subEnd >= notification_setAfter && subEnd < (notification_setAfter + intervalTime)) {
                            //send notification
                            console.log('send notification after meeting==> ',
                                ' email:', user_email,
                                ' name:', user_name,
                                ' title:', event_title,
                                ' participants:', event_participants,
                                ' start:', event_start_date,
                                ' end:', event_end_date,
                                ' before:', notification_setBefore,
                                ' after:', notification_setAfter);
                            var participants = "";
                            for (var k = 0; k < event_participants.length; k++) {
                                participants = participants + "<b>" + event_participants[k].email + "</b><br/>";
                            }
                            var html = "Hello <b>" + user_name + "</b>," +
                                "<br><br> Your meeting <b>" + event_title + "</b> was scheduled to complete <b>" +
                                notification_setAfter + "</b> minutes at <b>" + event_end_date + "</b>.<br/><br/> Here are the participants that were invited: <br/><br/>" +
                                participants;

                            var subject = "Hello";
                            emailSender.sendEmail(user_email, html, html, subject);
                        }
                    }
                }

            }
        });
    }

};
