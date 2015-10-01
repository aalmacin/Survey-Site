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

                var mySurvey = function() {
                        $http.get('/mysurveys').then(function(response) {
                                $scope.surveys = response.data;
                        });
                }

                var responseData = function() {
                        $http.get('/surveys/' + $routeParams.id + '/response').then(function(response) {
                                $scope.survey = response.data;
                        });
                }

                var allSurveys = function() {
                        $http.get('/surveys').then(function(response) {
                                $scope.surveys = response.data;
                        });
                }

                var surveyInit = function() {
                        $scope.currentDate = new Date();
                        var date = $scope.currentDate.toLocaleDateString();
                        var time = $scope.currentDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
                        $scope.currentDate = new Date(
                                date + "," + time
                        );
                        $scope.survey = {
                                "activation": $scope.currentDate,
                                "expiration": $scope.currentDate
                        };

                        $scope.questions = [];
                        $scope.errors = new Array();

                        // All of the functions used by both edit and create pages
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

                var analyzeResults = function(data, action) {
                        $scope.errors = new Array();
                        $scope.successMsg = null
                        if(data.success) {
                                $scope.successMsg = "Successfully "+action+" survey.";
                                if(action !== 'Deleted') {
                                        $scope.survey = {
                                                "activation": $scope.currentDate,
                                                "expiration": $scope.currentDate
                                        };
                                }
                                $scope.questions = [];
                        } else {
                                $scope.errors = data.errors;
                        }
                }


                // Create
                var setupCreate = function() {
                        $scope.createSurvey = function() {
                                $http.post('/surveys', {
                                        survey: $scope.survey,
                                        questions: $scope.questions
                                })
                                .then(function(response) {
                                        analyzeResults(response.data, "Created");
                                }, function(response){
                                        console.log(response);
                                });
                        }
                }

                // Edit
                var setupEdit = function() {
                        $http.get('/surveys/' + $routeParams.id + '/response').then(function(response) {
                                var surveyData = response.data;
                                if(surveyData && surveyData._id) {
                                        $scope.survey = {};
                                        $scope.survey._id = surveyData._id;
                                        $scope.survey.description = surveyData.description;
                                        $scope.survey.activation = new Date(surveyData.activation);
                                        $scope.survey.expiration = new Date(surveyData.expiration);

                                        $scope.questions = new Array();

                                        for(var i = 0; i < surveyData.questions.length; i++) {
                                                var question = surveyData.questions[i];

                                                var answers = new Array();
                                                for(var j=0; j < question.answers.length; j++) {
                                                        var answer = question.answers[j];
                                                        answers.push({
                                                                "id" : j,
                                                                "_id" : answer._id,
                                                                "responses" : answer.responses,
                                                                "text" : answer.text
                                                        });
                                                }

                                                $scope.questions.push({
                                                        "id" : i,
                                                        "_id" : question._id,
                                                        "text" : question.text,
                                                        "answers" : answers
                                                });
                                        }
                                }
                        });

                        $scope.editSurvey = function() {
                                $http.put('/surveys/'+$routeParams.id, {
                                        survey: $scope.survey,
                                        questions: $scope.questions
                                })
                                .then(function(response) {
                                        analyzeResults(response.data, "Updated");

                                }, function(response){
                                        console.log(response);
                                });
                        }

                }

                var deleteSurveySetup = function() {
                        $scope.deleteSurvey = function(id) {
                                $http.delete('/surveys/'+id)
                                .then(function(response) {
                                        analyzeResults(response.data, "Deleted");
                                        mySurvey();
                                }, function(response){
                                        console.log(response);
                                });
                        }
                }

                if ($("#surveyCreatePage").length > 0) {
                        setupCreate();
                }

                if ($("#surveyEditPage").length > 0) {
                        setupEdit();
                }

                if($("#surveyEditPage").length > 0 || $("#surveyCreatePage").length > 0) {
                        surveyInit();
                }

                if ($("#allSurveys").length > 0) {
                        allSurveys();
                }

                if ($("#mySurveysPage").length > 0) {
                        mySurvey();
                        deleteSurveySetup();
                }

                if ($("#reportPage").length > 0) {
                        $scope.getReport = function() {
                                var returnArr = new Array();
                                var questions = $scope.survey.questions;
                                for(var i = 0 ; i < questions.length ; i++) {
                                        var question = questions[i];

                                        var answers = new Array();

                                        for(var j = 0 ; j < question.answers.length ; j++) {
                                                var answer = question.answers[j];
                                                answers.push(answer.text);
                                                answers.push(answer.responses.length);
                                        }
                                        returnArr.push({
                                                text: question.text,
                                                answers: answers
                                        });
                                }
                                console.log(returnArr);
                                return returnArr;
                        }
                }
                if ($("#respondPage").length > 0 || $("#reportPage").length > 0) {
                        responseData();

                }
        }

        mainApp.controller("SurveyCtrl", ["$scope", "$http", "$location", "$window", "$routeParams", SurveyCtrl]);
})();
