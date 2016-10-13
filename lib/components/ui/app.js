angular.module('portalApp', ['ngResource', 'ui.router'])
    .run(function ($rootScope, $state) {

        $rootScope.$on('$stateChangeStart', function (toState, toStateParams) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;
        });
        $rootScope.$on('$stateChangeSuccess', function (fromState, fromParams) {

            $rootScope.previousStateName = fromState.name;
            $rootScope.previousStateParams = fromParams;
        });
        $rootScope.back = function () {
            if ($rootScope.previousStateName === 'activate' || $state.get($rootScope.previousStateName) === null) {
                $state.go('home');
            } else {
                $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
            }
        };
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('site', {
            'abstract': true
        });
    })
    .config(function ($stateProvider) {
        $stateProvider.state('portal', {
            parent: 'site',
            url: '/portal?plans&redirect&apikey&account',
            views: {
                'content@': {
                    templateUrl: 'views/portal.html',
                    controller: 'PortalCtrl'
                }
            }
        });
    })
    .config(function ($stateProvider) {
        $stateProvider.state('home', {
            parent: 'site',
            url: '/?configurl=',
            views: {
                'content@': {
                    templateUrl: 'views/home.html',
                    controller: 'HomeCtrl'
                }
            }
        });

    })
    .config(function ($stateProvider) {
        $stateProvider.state('validation', {
            parent: 'site',
            url: '/validation?apikey&redirect',
            views: {
                'content@': {
                    templateUrl: 'views/validation.html',
                    controller: 'ValidationCtrl'
                }
            }
        });

    })
    .filter('unquote',function(){
        return function(input){
            return angular.isDefined(input) &&
                   angular.isString(input) ?
                        input.replace(/\"/g,'') : input;
        }
    });
