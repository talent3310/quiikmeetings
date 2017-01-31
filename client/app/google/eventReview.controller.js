
'use strict';

angular.module('calendarApp')
  .controller('EventReviewCtrl', ['$scope','Review','$state','Bootbox', 'Auth', '$location', function ($scope, Review, $state, Bootbox, Auth, $location) {

    $scope.rank = {};
    $scope.progress = {};
    $scope.user = Auth.getCurrentUser();

    $scope.notSubmitted = true;

    for (var i=1; i<=10; i++){
      $scope.rank[i] = i;
      $scope.progress[i] = i;
    }

    $scope.reviewItems = [{
      rankValue: '',
      rankProgress: '',
      comment: ''
    }];

    /**
     * Submit review form data
     */

    $scope.saveReview = function(form) {
      $scope.submitted = true;
      if (form.$valid) {
        var reviewInfo = $scope.reviewItems;
        var thread_id = $state.params.thread_id;
        var event_id = $state.params.event_id;
        var email = $state.params.email;

        Review.saveReviews(reviewInfo, thread_id, event_id, email)
          .then(function (response) {
            console.log(response);
            var msg = 'Thank you for your review!';
            if(response.error){
              msg = response.error;
            }
            Bootbox.showAlert(msg);

            if(Object.keys($scope.user).length>0 && $scope.user.email){
              $location.path('/threads/');
            }
            else{
              $scope.notSubmitted = false;
            }

          })
          .catch(function (err) {
            $scope.errors.other = err.message;
            $scope.notSubmitted = false;
          });
      }
    };
  }]);