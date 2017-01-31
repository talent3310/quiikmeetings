/**
 * Created by sohel on 4/30/15.
 */

'use strict';

angular.module('calendarApp')
  .factory('Bootbox', function () {
    return {
      /**
       * show alert dialog
       * @param msg
       */
      showAlert: function (msg) {
        bootbox.alert(msg);
      }
    }
  });