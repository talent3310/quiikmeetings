


'use strict';

module.exports = function () {
  var EventThread = require('../models/eventThread')();
  var config = require('../config/environment');
  var errorHandler = require('../services/error_handler/errors')();

  return {

    /**
     * get thread data
     * @param req, request param from express
     * @param res, response param from express
     */
    getThreads: function (req, res) {
      EventThread.getThreads(req.user._id, function (err, threads) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(threads);
        }
      });
    },

    archiveThread: function (req, res) {
      EventThread.archiveThread (req.params.thread_id, function (err) {
        if (err) {
          res.send ({msg: "Something went wrong."});
        }
        else {
          res.send ({success: true});
        }
      })
    },

    getThreadDetails: function (req, res) {
      var thread_id = req.params.thread_id;
      EventThread.getThreadDetails(thread_id, function (err, threads) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(threads);
        }
      });
    },

    /**
     * get all thread data
     * @param req, request param from express
     * @param res, response param from express
     */
    getAllThreads: function (req, res) {
      EventThread.getAllThreads(function (err, threads) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(threads);
        }
      });
    },
    
    /**
     * save thread data
     * @param req
     * @param res
     */
    saveThread: function(req, res){
      if(req.body._id){
        EventThread.update(req.body, function(error, thread){
          if(error){
            if (error) return errorHandler.validationError(res, error);
          }
          else{
            res.send(thread);
          }
        });
      }
      else{
        EventThread.create(req.body, function(error, thread){
          if(error){
            if (error) return errorHandler.validationError(res, error);
          }
          else{
            res.send(thread);
          }
        });
      }
    }
  }
};