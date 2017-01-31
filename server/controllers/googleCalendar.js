/**
 * Created by sohel on 6/27/15.
 */

'use strict';

module.exports = function () {

  var google = require('googleapis');
  var googleAuth = require('google-auth-library');

  var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
  var credentials =  require('../config/google_client_secret.json');
  var User = require('../schemas/UserSchema');

  return {

    /**
     * get auth url
     * @param req, request param from express
     * @param res, response param from express
     */
    getAuthUrl: function (req, res) {

      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      });

      res.send(authUrl);

    },

    /**
     * saves the authorization token to db
     * @param req
     * @param res
     */
    saveToken: function (req, res) {
      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      oauth2Client.getToken(req.body.auth_code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          res.send({error: err})
        }
        else{
          User.findById(req.user._id, function(err, user){
            if(!err){
              user.google_calendar_token = JSON.stringify(token);
              user.save();
              res.send({success: true, token : token.access_token});
            }
            else{
              res.send({success: false, token : token.access_token});
            }
          });
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
    getEvents: function(req, res){

      // set date range from req params
      var dateFrom = req.params.date_from;
      var dateTo = req.params.date_to;

      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      oauth2Client.credentials = JSON.parse(req.user.google_calendar_token);
      console.log(JSON.parse(req.user.google_calendar_token))


      var calendar = google.calendar('v3');
      calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: dateFrom,
        timeMax: dateTo,
        maxResults: 25000,
        singleEvents: true,
        orderBy: 'startTime'
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }

        var events = response.items;
        res.send(events);
        if (events.length == 0) {
          console.log('No upcoming events');
        } else {
          console.log('Upcoming 25000 events:');
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            console.log('%s - %s', start, event.summary);
          }
        }
      });
    },
    /**
     * get an selected event from google calender
     * @param req
     * @param res
     */
    getSelectedEvent: function(req, res){
      var eventId = req.params.eventId;

      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      oauth2Client.credentials = JSON.parse(req.user.google_calendar_token);
      console.log(JSON.parse(req.user.google_calendar_token))

      var calendar = google.calendar('v3');
      calendar.events.get({
        auth: oauth2Client,
        calendarId: 'primary',
        alwaysIncludeEmail: true,
        eventId: eventId
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else{
          console.log(response);
          res.send(response);
        }

      });
    }
  }
};