'use strict';

angular.module('calendarApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, $intercom) {
    $scope.menu = [{
      'title': 'Dashboard',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
		$scope.isUser = Auth.isUser;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();

      $intercom.shutdown();
      console.log('logout');
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });