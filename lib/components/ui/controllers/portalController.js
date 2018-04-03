/* global Materialize */

angular.module('portalApp').controller("PortalCtrl", ["$scope", "$http", "$stateParams", "$state", function ($scope, $http, $stateParams, $state) {

    //Set var from parameters of url
    $scope.plansUrl = $stateParams.plansUrl.replace("http:", "https:").replace("10880", "443");
    $scope.redirectUrl = $stateParams.redirectUrl;
    $scope.apikey = $stateParams.apikey;
    $scope.account = $stateParams.account;

    $scope.model = {};

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
        $scope.plansUrl = $stateParams.plans.replace("http:", "https:").replace("10880", "443");
    }
    console.log("PLANS_URL (modified): " + $scope.plansUrl);
    console.log("REDIRECT_URL: " + window.localStorage.redirect);
}
]);
