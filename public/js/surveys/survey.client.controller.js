(function() {
        var mainApp = angular.module("mainApp");

        var SurveyCtrl = function ($scope, $http, $window) {
                console.log("Here my firend at SurveyCtrl");
        }

        mainApp.controller("SurveyCtrl", ["$scope", "$http", "$window", SurveyCtrl]);
})();
