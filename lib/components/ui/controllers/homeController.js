/* global Materialize */

angular.module('portalApp').controller("HomeCtrl", ["$scope", "$state", function ($scope, $state) {

        $scope.portalConfigUrl = "";
        $scope.onSubmitConfig = function () {

            //TODO: Check if configurl is valid url
            if ($scope.portalConfigUrl) {
                $state.go('portal', {
                    configurl: $scope.portalConfigUrl
                });
            } else {
                Materialize.toast('Please, provide a valid JSON configuration URL.', 3000);
            }

        };

    }]);