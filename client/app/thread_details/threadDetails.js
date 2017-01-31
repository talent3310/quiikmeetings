angular.module('calendarApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('thread_details', {
        url: '/thread_details/:thread_id',
        templateUrl: 'app/thread_details/moreDetails.html',
        controller: 'ThreadMoreDetailsCtrl',
        resolve: {
          reloader: 'ReloadHelper'
        }
      })
      .state('event_details', {
        url: '/event_details/:thread_id/:event_id',
        templateUrl: 'app/thread_details/eventDetails.html',
        controller: 'EventDetailsCtrl',
        resolve: {
          reloader: 'ReloadHelper'
        }
      })
      .state('manage_participants', {
        url: '/manage_participants/:thread_id/:event_id',
        templateUrl: 'app/thread_details/manageParticipants.html',
        controller: 'ManageParticipantsCtrl',
        resolve: {
          reloader: 'ReloadHelper'
        }
      })
    ;
  });
