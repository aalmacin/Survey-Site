(function() {
        if ($("#allSurveys").length > 0) {
                var mainApp = angular.module("mainApp", ["ngRoute", "ngMessages"]);
                mainApp.config(function($routeProvider) {
                        $routeProvider
                                .when( "/", {
                                        templateUrl: "./views/surveys/surveys.html",
                                        controller: "SurveyCtrl"
                                } )
                                .when( "/allsurveys", {
                                        templateUrl: "./views/surveys/surveys.html",
                                        controller: "SurveyCtrl"
                                } )
                                .when( "/respond/:id", {
                                        templateUrl: "./views/surveys/read.html",
                                        controller: "SurveyCtrl"
                                } )
                                .otherwise({redirectTo: "/allsurveys"});
                });
        } else {
                var mainApp = angular.module("mainApp");
        }

        var SurveyCtrl = function ($scope, $http, $location, $window, $routeParams) {
                $scope.message = $location.search().msg;
                if ($("#surveyCreatePage").length > 0) {
                        var currentDate = new Date();
                        var date = currentDate.toLocaleDateString();
                        var time = currentDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
                        currentDate = new Date(
                                date + "," + time
                        );
                        $scope.survey = {
                                "activation": currentDate,
                                "expiration": currentDate
                        };
                        $scope.questions = [];
                        $scope.errors = new Array();

                        $scope.createSurvey = function() {
                                $http.post('/surveys', {
                                        survey: $scope.survey,
                                        questions: $scope.questions
                                })
                                .then(function(response) {
                                        $scope.errors = new Array();
                                        $scope.successMsg = null
                                        if(response.data.error) {
                                                $scope.errors = response.data.errors;
                                        } else {
                                                $scope.successMsg = "Successfully created survey.";
                                                $scope.survey = {
                                                        "activation": currentDate,
                                                        "expiration": currentDate
                                                };
                                                $scope.questions = [];
                                        }

                                }, function(response){
                                        console.log('Error');
                                        console.log(response);
                                });
                        }


                        $scope.addAnswers = function(id) {
                                var c=0, question = null;
                                while( question === null && c < $scope.questions.length) {
                                        if($scope.questions[c].id == id) {
                                                question = $scope.questions[c];
                                        }
                                        c++;
                                }
                                question.answers.push({id: question.answers.length});
                                return false;
                        }

                        $scope.removeAnswers = function(id) {
                                var c=0, question = null;
                                while( question === null && c < $scope.questions.length) {
                                        if($scope.questions[c].id == id) {
                                                question = $scope.questions[c];
                                        }
                                        c++;
                                }
                                question.answers.pop();
                                return false;
                        }

                        $scope.addQuestion = function() {
                                $scope.questions.push({id: $scope.questions.length, answers: []});
                        }
                        $scope.removeQuestion = function() {
                                $scope.questions.pop();
                        }
                }

                if ($("#allSurveys").length > 0) {
                        $http.get('/surveys').then(function(response) {
                                $scope.surveys = response.data;
                        });
                }

                if ($("#mySurveysPage").length > 0) {
                        $http.get('/mysurveys').then(function(response) {
                                $scope.surveys = response.data;
                        });
                }

                if ($("#respondPage").length > 0 || $("#reportPage").length > 0) {
                        $http.get('/surveys/' + $routeParams.id + '/response').then(function(response) {
                                $scope.survey = response.data;
                        });
                }
        }

        mainApp.controller("SurveyCtrl", ["$scope", "$http", "$location", "$window", "$routeParams", SurveyCtrl]);
})();
