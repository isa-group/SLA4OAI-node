angular.module('portalApp').controller("ValidationCtrl", ["$scope", "$stateParams", "$state", function ($scope, $stateParams, $state) {

        $scope.successOperation = false;
        if ($stateParams.apikey) {
            $scope.successOperation = true;
            $scope.apikey = $stateParams.apikey;

            $scope.redirect = window.localStorage.redirect;
        }

        $scope.goPortal = function () {
            $state.go('portal');
        };

        $scope.goToPreviousApp = function () {
            window.location.href = $scope.redirect + "?apikey=" + $scope.apikey; // + "?apikey=" + $scope.apikey;
        };

    }]);
