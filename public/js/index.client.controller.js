(function() {
var mainApp = angular.module("mainApp", ["ngRoute", "ngMessages", "ngCsv"]);
        mainApp.config(function($routeProvider) {
                $routeProvider
                        .when( "/", {
                                templateUrl: "./views/index.html",
                                controller: "SurveyCtrl"
                        } )
                        .when( "/editprofile", {
                                templateUrl: "./views/users/edit.html",
                                controller: "UserCtrl"
                        } )
                        .when( "/mysurveys", {
                                templateUrl: "./views/surveys/mysurveys.html",
                                controller: "SurveyCtrl"
                        } )
                        .when( "/surveys/:id", {
                                templateUrl: "./views/surveys/read.html",
                                controller: "SurveyCtrl"
                        } )
                        .when( "/surveys/:id/report", {
                                templateUrl: "./views/surveys/report.html",
                                controller: "SurveyCtrl"
                        } )
                        .when( "/newSurvey", {
                                templateUrl: "./views/surveys/create.html",
                                controller: "SurveyCtrl"
                        } )
                        .when( "/surveys/:id/edit", {
                                templateUrl: "./views/surveys/edit.html",
                                controller: "SurveyCtrl"
                        } )
                        .otherwise({redirectTo: "/"});
        });
}());
