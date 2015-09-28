(function() {
        var mainApp = angular.module("mainApp");

        var UserCtrl = function ($scope, $http, $window) {
                console.log("Here my firend at UserCtrl");
        }

        mainApp.controller("UserCtrl", ["$scope", "$http", "$window", UserCtrl]);
})();
