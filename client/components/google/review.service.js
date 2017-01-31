'use strict';

angular.module('calendarApp')
  .factory('Review', function Review($location, $rootScope, $http, $q) {
    return {

      /**
       * save review
       * @param reviewInfo
       * @param thread_id
       * @param event_id
       * @param email
       * @param callback
       * @returns {jQuery.promise|promise.promise|d.promise|promise|r.promise|.ready.promise|*}
       */

      saveReviews: function(reviewInfo, thread_id, event_id, email, callback) {
        var cb = callback || angular.noop;
        var deferred= $q.defer();

        $http.post('/api/user_review', {
          rank_value : reviewInfo.rankValue,
          rank_progress : reviewInfo.rankProgress,
          comment : reviewInfo.comment,
          thread_id : thread_id,
          event_id : event_id,
          user_email : email
        }).
          success(function(response) {
            deferred.resolve(response);
            return cb();
          }).
          error(function(err) {
            return cb(err);
          }.bind(this));
        return deferred.promise;
      },

      /**
       * get reviews
       * @param thread_id
       * @param callback
       */
      getReviews : function(thread_id, callback){
        var cb = callback || angular.noop;
        $http.get('/api/user_review/events'+ '/' + thread_id ).
          success(function(data) {
            return cb(null,data);
          }).
          error(function(err) {
            return cb(err,null);
          }.bind(this));
      },
      /**
       * get all the reviews
       * @param idList, thread ids
       * @param callback
       * @returns {jQuery.promise|promise.promise|d.promise|promise|r.promise|.ready.promise|*}
       */

      getAllReviews : function( idList, callback){
        var cb = callback || angular.noop;
        var deferred= $q.defer();

        var data = {ids: idList};
        $http.post('/api/user_review/all_reviews', data)
          .success(function(response) {
          console.log('Reviews: ',response);
          deferred.resolve(response);
          return cb(null,response);
        }).
          error(function(err) {
            return cb(err,null);
          }.bind(this));
        return deferred.promise;
      },

      /**
       * calculates the average of sent reviews
       * @param reviews
       * @returns {Array}
       */
      findAverageOfReviews : function(reviews){
        var avgList = [];
        //group the reviews by thread id
        var groupedList = _.groupBy(reviews, function (item) {
          return item.thread_id;
        });


        //iterate for each group
        _.each(groupedList, function (group, key) {

          //find the sum of current thread
          var rankSum = 0, rankProgressSum = 0;
          _.each(groupedList[key], function (reviewData) {
            rankSum = rankSum + reviewData.rank_value;
            rankProgressSum = rankProgressSum + reviewData.rank_progress;
          });

          avgList.push({
            thread_id : key ,
            avgValue : parseFloat((rankSum / groupedList[key].length).toFixed(2)),
            avgProgress :parseFloat((rankProgressSum / groupedList[key].length).toFixed(2))
          });
        });
        return avgList;
      },

      /**
       * send review email to the selected users
       * @param reviewLinkList
       * @param threadID
       * @param eventID
       * @param eventName
       * @param callback
       * @returns {promise.promise|Function|*|jQuery.promise|deferred.promise|{then, catch, finally}}
       */

      sendReviewLink: function (reviewLinkList, threadID, eventID, eventName,  callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/user_review/send_Review_Link', {
          reviewLinkList: reviewLinkList,
          threadID: threadID,
          eventID: eventID,
          eventName : eventName
        })
          .success(function (response) {
            deferred.resolve(response);
            return cb(response);
          }).
          error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      }
    };
  });
