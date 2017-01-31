
'use strict';

module.exports = function () {
  var EventModel = require('../models/event')();
  var config = require('../config/environment');
  var errorHandler = require('../services/error_handler/errors')();

  return {
    /**
     * creates a new event
     * @param req
     * @param res
     */

    createEvent: function(req, res){
      if(req.body._id){
        EventModel.update(req.body, function(error, event){
          if(error){
            if (error) return errorHandler.validationError(res, error);
          }
          else{
            res.send(event);
          }
        });
      }
      else{
        EventModel.create(req.body, function(error, event){
          if(error){
            if (error) return errorHandler.validationError(res, error);
          }
          else{
            res.send(event);
          }
        });
      }
    }
  }
};