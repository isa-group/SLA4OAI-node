/* global Materialize */

angular.module('portalApp').controller("PortalCtrl", ["$scope", "$http", "$stateParams", "$state", function ($scope, $http, $stateParams, $state) {

        $scope.model = {};
        $scope.plansUrl = {};
        var proxyURL = "/api/v1/proxy?url=";
        
        window.localStorage.redirect = $stateParams.redirect;
        
        if (!$stateParams.plans) {
            if (window.localStorage.plansUrl) {
                $state.go('portal', {
                    plans: window.localStorage.plansUrl
                });
            } else {
                $state.go('home');
            }
        } else {
            window.localStorage.plansUrl = $stateParams.plans;
        }

        if ($stateParams.plans) {
            $scope.plansUrl = $stateParams.plans;
        }
        console.log("PLANS_URL: " + $scope.plansUrl);
        console.log("REDIRECT_URL: " + window.localStorage.redirect);
    }
]);