/**
 * User: Sohel
 * Date: 3/31/15
 * Time: 6:53 PM
 */
module.exports = function () {
  var User = require('../schemas/UserSchema');
  return {
    /**
     * get the users data from db
     * @param callback
     */
    getUsers: function (callback) {
      User.find({}, function(error, users){
        if(!error){
          callback(null, users);
        }
        else{
          callback(error);
        }
      });
    },

    /**
     * get user by id
     * @param userId
     * @param callback
     */
    getUserByID : function(userId, callback){
      User.findOne({
        _id: userId
      }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
       callback(err, user);
      });
    },
    /**
     * get user who have specifed channelID
     * @param userId
     * @param callback
     */
    getUserHaverSpecifedChannel : function(channelId, callback){
      User.findOne({channelId: channelId}).exec(function(err, user) {
          if (err) {
              callback(err);
          } else {
              //update participants
              callback(null, user);
          }
      });
    },
    /**
     * saves a new user to the schema
     * @param userBody
     * @param callback
     */
    create: function(userBody, callback){
      var newUser = new User(userBody);
      newUser.save(function(err, user) {
        if (!err){
         callback(null, user);
        }
        else{
          callback(err);
        }
      });
    }

  }
};