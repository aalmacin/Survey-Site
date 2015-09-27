var mainApp = angular.module("mainApp", ["ngMessages"]);

var LoginCtrl = function ($scope) {
        $scope.loginUser = {};
        $scope.errors = [];
  }
  mainApp.controller("LoginCtrl", ["$scope", LoginCtrl]);
