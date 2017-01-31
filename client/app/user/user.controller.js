'use strict';

angular.module('calendarApp')
  .controller('UserCtrl', ['$scope', '$location', 'Auth', 'Bootbox', function ($scope, $location, Auth, Bootbox) {
    $scope.message = 'Hello';

    /**
     * saves users record
     * @param form
     */
    $scope.saveUser = function (form) {
      $scope.user.fromAdmin = Auth.isAdmin();
      Auth.createUser($scope.user)
        .then( function() {
          // Account created, redirect to home
          if(Auth.isAdmin()){
            Bootbox.showAlert("The user has been created successfully");
            $location.path('/user-list');
          }
          else{
            $location.path('/');
          }
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
    }

  }]);
