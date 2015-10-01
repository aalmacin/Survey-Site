(function() {
        var mainApp = angular.module("mainApp", ["ngMessages"]);

        var LoginCtrl = function ($scope, $http, $window) {
                $scope.loginUser = {};
                $scope.errors = [];

                // Make an api call to login after a form submit and then login the user.
                $scope.login = function() {
                        $scope.errors = [];
                        $http.post('/login', $scope.loginUser).then(function(response) {
                                if(!response.data.success) {
                                        $scope.errors = [response.data.message];
                                        $scope.loginUser = {};
                                } else {
                                        // Reload to let the backend determine which view to render
                                        $window.location.reload();
                                }
                        });
                }
          }
          mainApp.controller("LoginCtrl", ["$scope", "$http", "$window", LoginCtrl]);
}());
