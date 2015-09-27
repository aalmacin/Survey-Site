var mainApp = angular.module("mainApp", ["ngMessages"]);

var LoginCtrl = function ($scope, $http, $window) {
        $scope.loginUser = {};
        $scope.errors = [];

        $scope.login = function() {
                $scope.errors = [];
                $http.post('/login', $scope.loginUser).then(function(response) {
                        if(!response.data.status) {
                                $scope.errors = [response.data.message];
                                $scope.loginUser = {};
                        } else {
                                $window.location.reload();
                        }
                });
        }
  }
  mainApp.controller("LoginCtrl", ["$scope", "$http", "$window", LoginCtrl]);
