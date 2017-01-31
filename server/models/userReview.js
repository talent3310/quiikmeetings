
module.exports = function () {
  var UserReview = require('../schemas/UserReviewSchema');
  var EventThread = require('../schemas/EventThreadSchema');
  return {
    /**
     * saves a new review
     * @param userBody
     * @param callback
     */
    create: function(userBody, callback){

      //check if review already done or not
      UserReview.findOne({
        thread_id : userBody.thread_id,
        event_id : userBody.event_id,
        user_email : userBody.user_email
      }).exec(function(err, review){
        if(review){
          callback({error: 'You have already reviewed.'});
        }
        else{
          var newUserReview = new UserReview(userBody);
          newUserReview.save(function(err, review) {
            if (!err){
              callback(null, review);
            }
            else{
              callback(err);
            }
          });
        }
      });

    },
    
    /**
     * get the review
     * @param thread_id
     * @param event_id
     * @param callback
     */

    getReviews :function (thread_id, event_id, callback) {
      var condition = {
        thread_id : thread_id
      };
      if(event_id){
        condition.event_id = event_id;
      }

      UserReview.find(condition).populate('thread_id').exec(function(e, reviewItems){
        if(!e){
          if(reviewItems && reviewItems.length>0){
            var response = {
              reviews : reviewItems,
              events: reviewItems[0].thread_id.events
            };
          }
          else{
            var response = {
              reviews : [],
              events: []
            };
          }

          callback(null, response);
        }
        else{
          callback(e);
        }
      });
    },

    /**
     * get the reviews of all threads
     * @param threadIds
     * @param callback
     */

    getReviewsOfThreads : function (threadIds, callback) {

      UserReview.find({ thread_id : {$in: threadIds}}).exec(function(e, reviewItems){
        if(!e){
          callback(null, reviewItems);
        }
        else{
          callback(e);
        }
      });

    }
  }
};