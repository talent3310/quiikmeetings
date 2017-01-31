/**
 * User: Delwar
 * Date: 4/26/15

 */

'use strict';

module.exports = function () {
  var UserAvailabilityModel = require('../models/userAvailabilityModel')();
  var emailHandler = require('../services/email/handler')();

  return {
    /**
     * get user free times data
     * @param req, request param from express
     * @param res, response param from express
     */
    getUserAllAvailabilities: function (req, res) {
      UserAvailabilityModel.getUserAllAvailabilities( req.params.date, function (err, userAvailability) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(userAvailability);
        }
      });
    },

    getAllAvailabilitiesOfUser :  function (req, res) {
      console.log(req.user)
      UserAvailabilityModel.getAllAvailabilitiesOfUser(req.user.id, function (err, userAvailability) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(userAvailability);
        }
      });
    },

    /**
     * get user free times data
     * @param req, request param from express
     * @param res, response param from express
     */
    getUserAvailabilities: function (req, res) {
      UserAvailabilityModel.getUserAvailabilities( req.params.date, function (err, userAvailability) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(userAvailability);
        }
      });
    },
    /**
     * get user free times data
     * @param req, request param from express
     * @param res, response param from express
     */
    getUserFreeTimes: function (req, res) {
      UserAvailabilityModel.getFreeTimes(req.params.user_id, req.params.date, function (err, userAvailability) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(userAvailability);
        }
      });
    },

    /**
     * get user free times data
     * @param req, request param from express
     * @param res, response param from express
     */
    getUserFreeTimesByDateRange: function (req, res) {
      UserAvailabilityModel.getUserFreeTimesByDateRange(req.params.user_id, req.params.date_From,req.params.date_To, function (err, userAvailability) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(userAvailability);
        }
      });
    },
    /**
     * save user availability data
     * @param req
     * @param res
     */
    saveUserAvailability: function(req, res){
      console.log('In controller', req.body);
      UserAvailabilityModel.saveUserAvailability(req.body, function(err, userAvailability){
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(userAvailability);
        }
      });
    },

    /**
     * send email controller
     * @param req, request param from express
     * @param res, response param from express
     */
    sendInvitation: function (req, res) {
      var invitationData = req.body;
      console.log('In controller', invitationData);
      emailHandler.sendInvitationEmails(invitationData, function (err, status) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send({msg: 'Successfully sent email(s).'});
        }
      });
    }
  }
};