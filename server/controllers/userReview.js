
'use strict';

module.exports = function () {
  var userReview = require('../models/userReview')();
  var EventThread = require('../models/eventThread')();
  var config = require('../config/environment');
  var errorHandler = require('../services/error_handler/errors')();
  var emailHandler = require('../services/email/handler')();
  var _ = require('lodash');

  return {
    /**
     * Save user Review data
     * @param req
     * @param res
     */

    saveReview: function(req, res){
      userReview.create(req.body, function(error, review){
        if(error){
          res.send(error);
        }
        else{
          EventThread.registerReview (req.body.thread_id, req.body.event_id);
          res.send(review);
        }
      });
    },
    /**
     * get the review
     * @param req
     * @param res
     */

    getReviews: function (req, res) {
      var event_id = req.params.event_id;
      var thread_id = req.params.thread_id;

      userReview.getReviews(thread_id, event_id, function (err, reviewItems) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(reviewItems);
        }
      });
    },
    /**
     * get the reviews of sent threads
     * @param req
     * @param res
     */

    getReviewsOfThreads : function (req, res) {
      var ids = req.body.ids;
      console.log('threads ids in get all reviews:',ids);
      userReview.getReviewsOfThreads(ids, function (err, response) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(response);
          console.log('response',response);
        }
      });
    },

    /**
     * sends email with a review link
     * @param req
     * @param res
     */
    sendReviewLink: function (req, res) {
      var threadID = req.body.threadID;
      var eventID = req.body.eventID;

      console.log ("Sending the review link");
      console.log('threadID', threadID);
      console.log('eventID', eventID);

      var list = req.body.reviewLinkList;

      EventThread.registerEmailSend (threadID, eventID, list.length);
      _.each(list, function(item){
        console.log('info list-> ', req.headers.host, 'req.body.eventName=> ', req.body.eventName);
        emailHandler.sendReviewLinkEmail(item.name, req.headers.host, threadID, eventID ,  req.body.eventName,  item.email);
      });

      res.send({emailSent : true});
    }
  }
};