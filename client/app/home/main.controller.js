'use strict';

angular.module('calendarApp')
    .controller('MainCtrl', function($scope, $http, Auth, $state, $location, EventThread, Cronofy) {
        $scope.isLoggedIn = Auth.isLoggedIn;

        if (!$scope.isLoggedIn()) {
            $location.path('/login');
        }

        $scope.user = Auth.getCurrentUser(); 
        $scope.googleNeedsSync = true;

        if ($scope.user.cronofy_auth_token) {
            $scope.googleNeedsSync = false;
        }
        
        if ($scope.isLoggedIn()) {
            Cronofy.refreshToken().then(function(data){
                console.log('refreshing token');
                if(data.success){
                    EventThread.getThreads(function(err, response) {

                        if (response.length > 0) {
                            $location.path("/threads/");
                        } else {
                            $state.go("thread-new-cronofy");
                        }
                    });
                } else
                alert("can't get access to calendar!");

            }).catch(function(err) {

            });     
        }

        // Set the authentication URL
        Cronofy.getAuthUrl(function(err, data) {
            if (data) {
                $scope.requestAuthorizationUrl = data;
            }
        });

    });
