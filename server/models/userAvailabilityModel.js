/**
 * User: Delwar
 * Date: 4/26/15
 */
module.exports = function () {
  var UserAvailability = require('../schemas/UserAvailabilitySchema');
  var moment = require('moment');
  return {

    /**
     * saves a new user Availability data to the schema
     * @param userAvailabilityBody
     * @param callback
     */
    create: function(userAvailabilityBody, callback){
      var newUserAvailability = new UserAvailability(userAvailabilityBody);
      newUserAvailability.save(function(err, userAvailability) {
        if (!err){
         callback(null, userAvailability);
        }
        else{
          callback(err);
        }
      });
    },

    /**
     * get all availability of an user
     * @param userId
     * @param callback
     */
    getAllAvailabilitiesOfUser : function( userId,  callback){
      //  var date = date +'T00:00:00.000Z'; //append the 00 hours to the date;
      UserAvailability.find({user_id : userId }).populate('user_id').exec(function(err, freeTimes){
        callback(err, freeTimes);
      });
    },

    /**
     * get user schedules
     * @param date
     * @param callback
     */
    getUserAllAvailabilities : function( date,  callback){

      //  var date = date +'T00:00:00.000Z'; //append the 00 hours to the date;
      UserAvailability.find().populate('user_id').exec(function(err, freeTimes){
        callback(err, freeTimes);
      });
    },
    /**
     * get user schedules
     * @param date
     * @param callback
     */
    getUserAvailabilities : function( date,  callback){

      //  var date = date +'T00:00:00.000Z'; //append the 00 hours to the date;
      UserAvailability.find({date : date }).populate('user_id').exec(function(err, freeTimes){
        callback(err, freeTimes);
      });
    },
    /**
     * get user schedules
     * @param user_id
     * @param callback
     */
    getFreeTimes : function(user_id, date,  callback){

    //  var date = date +'T00:00:00.000Z'; //append the 00 hours to the date;
      UserAvailability.findOne({user_id : user_id, date : date }, function(err, freeTimes){
        callback(err, freeTimes);
      });
    },
    /**
     * get user schedules by Date Range
     * @param user_id
     * @param Date From
     * @param Date To
     * @param callback
     */
    getUserFreeTimesByDateRange : function( user_id, date_From,date_To,  callback ){

      //  var date = date +'T00:00:00.000Z'; //append the 00 hours to the date;
      UserAvailability.find({user_id : user_id, date : {$gte:date_From,$lte:date_To} }, function(err, freeTimes){
        callback(err, freeTimes);
      });
    },
    /**
     *
     * @param user_id
     * @param data
     * @param callback

    saveUserAvailability: function ( data, callback){
      //check if the record already exist
      var date = moment(data.date);
      UserAvailability.findOne({user_id : data.user_id, date : data.date}, function(err, availabilityObj){
        if(availabilityObj){
          availabilityObj.free_times = data.free_times;

          availabilityObj.save(function(error, av){
            callback(error, av);
          })
        }
        else{
          UserAvailability.create(data, function(error, userAvailability){
            callback(error, userAvailability);
          });
        }

      });
    }
    ,*/
    /**
     *
     * @param user_id
     * @param data
     * @param callback
     */
    saveUserAvailability: function ( data, callback){

      var count=0;

      data.forEach( function( userdata ){

        //check if the record already exist
        var date = moment(userdata.date);
        UserAvailability.findOne({user_id : userdata.user_id, date : userdata.date}, function(err, availabilityObj){
          if( availabilityObj ){
            availabilityObj.free_times = userdata.free_times;

            availabilityObj.save(function(error, av){
              count++;
              if( count===data.length ) {
                callback(error, av);
              }

            })
          }
          else{
            UserAvailability.create(userdata, function(error, userAvailability){
              count++;
              if( count===data.length ) {
                callback(error, userAvailability);
              }

            });
          }
        });
      })
    }
  }
};