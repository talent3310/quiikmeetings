/**
 * Created by nafia on 5/1/2015.
 */
'use strict';

angular.module('calendarApp')
  .directive('datePicker', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        $timeout(function () {
          $(element).datetimepicker({
            format: 'YYYY-MM-DD'
          }).on('dp.change', function (event) {
            ngModel.$setViewValue(event.target.value);
          });
        });
      }
    };
  }]).directive('timePicker', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {

        $timeout(function () {
          $(element).datetimepicker({
            format: 'HH:mm:ss',
            stepping: 15

          }).on('dp.change', function (event) {

            ngModel.$setViewValue(event.target.value);
          });
        });

      }
    };
  }]).directive('dateRangePicker', [function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel, $parse) {


        var dateRanges = {
          'Today': [moment(), moment()],
          'Next 7 Days': [moment(), moment().add (7, 'days')],
          'Next 30 Days': [moment(), moment().add (30, 'days')],
        };

        ngModel.$formatters.unshift(function (modelValue) {
          if (!modelValue) return '';
          return modelValue;
        });

        ngModel.$parsers.unshift(function (viewValue) {
          return viewValue;
        });

        scope.$watch(attrs.ngModel, function (modelValue) {

          // set the date ranges and initialize the calender
          if (modelValue.dateRanges !== undefined) {
            dateRanges = modelValue.dateRanges;
            initializeCalender();
          }

          if (modelValue.startDate !== undefined && modelValue.endDate != undefined) {
            $(element).find('span').html(modelValue.startDate.format('YYYY-MM-DD') + ' - ' + modelValue.endDate.format('YYYY-MM-DD'));
          } else {
            $(element).find('span').html('Pick Date');
          }

        });
        /**
         * This method is used to initialized dateRange calender
         */
        function initializeCalender() {
          $(element).daterangepicker({
            format: 'YYYY-MM-DD',
            startDate: moment().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().endOf('month'),
            dateLimit: {days: 60},
            showDropdowns: true,
            showWeekNumbers: true,
            timePicker: false,
            timePickerIncrement: 1,
            timePicker12Hour: true,
            ranges: dateRanges,
            opens: 'left',
            drops: 'down',
            buttonClasses: ['btn', 'btn-sm'],
            applyClass: 'btn-primary',
            cancelClass: 'btn-default',
            separator: ' to ',
            locale: {
              applyLabel: 'Submit',
              cancelLabel: 'Cancel',
              fromLabel: 'From',
              toLabel: 'To',
              customRangeLabel: 'Custom',
              daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
              monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              firstDay: 1
            }
          }, function (start, end, label) {

            ngModel.$setViewValue({startDate: start, endDate: end});

            console.log(start.toISOString(), end.toISOString(), label);
            $(element).find('span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
          });
        }

        initializeCalender();

      }
    };
  }]);
