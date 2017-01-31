/**
 * User: Sohel
 * Date: 3/31/15
 * Time: 7:33 PM
 */

'use strict';

module.exports = function () {
  var User = require('../models/user')();
  var jwt = require('jsonwebtoken');
  var config = require('../config/environment');
  var emailHandler = require('../services/email/handler')();
  var errorHandler = require('../services/error_handler/errors')(); 

  return {

    /**
     * get user data
     * @param req, request param from express
     * @param res, response param from express
     */
    getUsers: function (req, res) {
      User.getUsers(function (err, users) {
        if (err) {
          res.send({msg: 'Something wrong! Check the error message', error: err})
        }
        else {
          res.send(users);
        }
      });
    },

    /**
     * save user data
     * @param req 
     * @param res
     */
    saveUser: function(req, res){
      User.create(req.body, function(error, user){
        if(error){
          if (error) return errorHandler.validationError(res, error);
        }
        else{
          var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
          //send email
          emailHandler.sendAccountSetupEmail(user.lastname, req.headers.host, req.body.password, user.email);
          if(res.fromAdmin){
            res.send(user);
          }
          else{
            res.json({ token: token });
          }
        }
      });
    },

    /**
     * Get my info
     * @param req
     * @param res
     * @param next
     */
    me: function(req, res, next) {
      User.getUserByID(req.user._id, function(err, user){
        if (err) return next(err);
        if (!user) return res.json(401);
        res.json(user);
      });
    }

  }
};