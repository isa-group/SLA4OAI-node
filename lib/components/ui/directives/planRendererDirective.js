/* global Materialize */

angular.module('portalApp')
        .directive('planRenderer', ["$timeout", "$http", "$q", "$compile", "$filter", "$state", "$stateParams", function ($timeout, $http, $q, $compile, $filter, $state, $stateParams) { // Don't delete any of this params. Some of them are used in .ctl files
                var proxyURL = "/api/v1/proxy?url=";
                return {
                    restrict: 'E',
                    transclude: true,
                    scope: {
                        plans: '=',
                        viewUrl: '=',
                        ctlUrl: '='
                    },
                    link: function (scope, element, attrs) {
                        //TODO: check file url extensions
                        console.log("VIEW_URL: " + scope.viewUrl);
                        console.log("CTL_URL: " + scope.ctlUrl);
                        $q.all([
                            $http.get(scope.plans),
                            $http.get(scope.viewUrl)
                        ]).then(function (arrayOfResults) {

                            var templateAt = arrayOfResults[0].data,
                                    templateAng = arrayOfResults[1].data;
                            
                            //console.log(templateAt);
                            //console.log(templateAng);
                            
                            scope.templateContent = templateAt;
                            
                            try{
                                
                                $timeout(function () {
                                    var doc = jsyaml.safeLoad(templateAt);
                                    scope.model = doc;

                                    $compile(templateAng)(scope, function (cloned, scope) {
                                            element.append(cloned);
                                    });

                                    console.log("Compile from 'new' version of governify model");                                    
                                }, 200);
                                
                            }catch(e){
                                //Deprecated ( This is the old way to compile at view, from the old version of governify model [iAgree] )
                                //In the future this won't be suportted.
                                $http.post("/api/v1/converter", templateAt).then(function (response) {
                                    scope.model = response.data;
                                    console.log("model", scope.model);
                                    $compile(templateAng)(scope, function (cloned, scope) {
                                        element.append(cloned);
                                    });
                                });
                                
                                console.log("Compile from 'old' version of governify model");
                                
                            }

                        });
                    },
                    controller: function ($scope) {

                        // User interface wrapper
                        //FIXME: remove scope after AWS workshop
                        $scope.showModal = function (headerContent, bodyContent, callbackDummy, callbackPaypal) {

                            var modal = $("#genericModal");

                            $("#buyFree").unbind("click").on("click", function () {
                                if (callbackDummy)
                                    callbackDummy();
                            });
                            $("#buyPaypal").unbind("click").on("click", function () {
                                if (callbackPaypal)
                                    callbackPaypal();
                            });

                            modal.find(".modal-content h4").html(headerContent);
                            modal.find(".modal-content p").html(bodyContent);
                            modal.openModal();

                        };
                        var hidePaypalButton = function () {
                            $("#buyPaypal").hide();
                            $("#buyFree").show();
                        };
                        var showPaypalButton = function () {
                            $("#buyFree").hide();
                            $("#buyPaypal").show();
                        };

                        if ($stateParams.clientid) {
                            $scope.defaultClientId = $stateParams.clientid;
                            console.log($scope.defaultClientId);
                        }

                        //TODO: check file url extensions
                        $http.get($scope.ctlUrl).then(
                                function successCallback(response) {
                                    if (response.data) {
                                        // Applying .ctl file content
                                        eval(response.data);
                                    } else {
                                        Materialize.toast("No data found on " + $scope.ctlUrl, 3000);
                                    }
                                },
                                function errorCallback(response) {
                                    Materialize.toast('Error: ' + response.status +
                                            ' trying to access \"' + $scope.ctlUrl + '\"', 3000);
                                }
                        );

                    }
                };
            }]);