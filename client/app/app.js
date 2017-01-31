/**
 * Created by sohel on 4/27/15.
 */

'use strict';

angular.module('calendarApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ui.router',
        'highcharts-ng',
        'ui.utils',
        'oc.lazyLoad',
        'ngToast',
        'ngRoute',
        'ngIntercom'
    ])
    .config(function($intercomProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        // angular intercom integration
        $intercomProvider
            .appID('s8pcpj0a');
        $intercomProvider
            .asyncLoading(true)

        //
        $urlRouterProvider
            .otherwise('/');

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
    })
    .service('ReloadHelper', function($q, $timeout, EventThread, Review, Auth) {
        var p = $q.defer();

        if (EventThread.threads) {
            return {};
        }
        console.log("Fetching threads since not in cache");
        EventThread.getThreads(function(err, response) {
            if (!err) {
                response = response.reverse();
                var eventThreads = response;

                //save the data for future uses
                EventThread.setThreads(response);

                _.each(EventThread.threads, function(thread) {
                    var events = thread.events;
                    events = _.filter(events, (function(event) {
                        var start = event.start ? new Date(event.start) : new Date();
                        return start.getTime() > new Date().getTime();
                    }));
                    var eventsSorted = _.sortBy(events, function(event) {
                        var start = event.start ? new Date(event.start) : new Date();
                        return start.getTime();
                    })
                    var allEventsSorted = _.sortBy(thread.events, function(event) {
                        var start = event.start ? new Date(event.start) : new Date();
                        return start.getTime();
                    })

                    if (eventsSorted[0]) {
                        thread.firstEvent = eventsSorted[0];
                    } else {
                        thread.firstEvent = allEventsSorted[0];
                        thread.noNextEvent = true;
                    }
                });
                var idList = _.pluck(response, function(item) {
                    return item.id;
                });

                // calculate average value and progress for each thread
                Review.getAllReviews(idList, function(error, response) {
                    var avgList = [];
                    if (!error) {
                        //save the data for future uses
                        EventThread.setReviews(response);
                        avgList = Review.findAverageOfReviews(response);
                    } else {
                        console.log("There was an error getting reviews");
                    }

                    if (avgList.length > 0) {
                        //save the data for future uses
                        EventThread.setAverages(avgList);

                        _.each(eventThreads, function(thread) {
                            var avg = _.find(avgList, function(avg) {
                                return avg.thread_id === thread.id;
                            });
                            thread.avgValue = avg ? avg.avgValue : 0;
                            thread.avgProgress = avg ? avg.avgProgress : 0;
                        });

                    }
                    console.log("EventThread: ", EventThread);
                    p.resolve();
                });
            } else {
                console.warn("There was an error ", err);
            }
        });

        return p.promise;
    })

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function(config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if (response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})

.run(function($rootScope, $location, $intercom, Auth) {
    
       
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                $location.path('/login');
            } else {
                 console.log('getCurrentUser===> ', Auth.getCurrentUser());
                 var currentUser = {
                    email: Auth.getCurrentUser().email,
                    name: Auth.getCurrentUser().name,
                    user_id: Auth.getCurrentUser().id,
                    created_at: Auth.getCurrentUser().created_at,
                    updated_at: Auth.getCurrentUser().updated_at
                 }

                 $intercom.boot(currentUser);
            }
        });
    });
});


// Ugly hack to make reloads work
window.reloadResolver = {

}
