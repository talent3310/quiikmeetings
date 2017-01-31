/**
 * Created by sohel on 10/10/15.
 */

'use strict';

angular.module('calendarApp')
  .factory('GoogleEvent', function ($location, $rootScope, $http, $q, Auth) {
    return {
      setEventData : function(data){
        this.event = data;
      }
    }
  });