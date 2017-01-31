/**

 * User: Sohel
 * Date: 4/30/15
 * Time: 6:51 PM

 * module clBootstrapDialog
 * uses isolated scope
 * added a method open() to the passed scope
 * so that it can be opened from parent controller
 */

'use strict';

angular.module('calendarApp')
  .directive('clBootstrapDialog', [function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        dialog: '=btDialog'
      },
      templateUrl: 'common/directives/bootstrapDialog.directive.html',
      link: function (scope, element, attrs) {
        //add e method to the scope object so that
        // we can open it from the controller
        scope.dialog.open = function () {
          $('#availability-list').modal('show');
        };

        scope.dialog.close = function () {
          $('#availability-list').modal('hide');
        };
      }
    };
  }]);
