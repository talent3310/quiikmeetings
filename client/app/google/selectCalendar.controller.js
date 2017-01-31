'use strict';

angular.module('calendarApp')
    .controller('SelectCalendarCtrl', ['$state', '$scope', '$location', 'Auth', 'Cronofy', function($state, $scope, $location, Auth, Cronofy) {
        
        $scope.user = {};
        $scope.user = Auth.getCurrentUser();

        if ($scope.user.cronofy_auth_token){
            $state.go("thread-new-cronofy");
            return
        }
        $scope.findMeetings = true;
        var data = {
            auth_code: $location.search().code
        }; 
        
        $scope.goCronofy = function() {
            $scope.findMeetings = false;
            Cronofy.saveToken(data)
            .then(function(data) {
                console.log('result is ', data);
                if (data.success) {
                    $state.go("thread-new-cronofy");
                } else {
                    $state.go("root");
                    console.log("Cronofy saveCode Error! It's empty");
                }
            })
            .catch(function(err) {

            });
        }

    }]);
