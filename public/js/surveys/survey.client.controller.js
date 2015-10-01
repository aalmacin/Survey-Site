/*
        This is the angular js file for the survey related pages. Survey controller is the name of the controller
*/
(function() {
        // If the user is not logged in, create a new module and reset the routing into a custom non-user one.
        if ($("#allSurveys").length > 0) {
                var mainApp = angular.module("mainApp", ["ngRoute", "ngMessages"]);

                // Reset the routing for non-logged/anonymous in user
                mainApp.config(function($routeProvider) {
                        // Anonymous users can view, and respond to surveys
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
                // If the user is logged in, no need to override the routing set in index.client.controller so just load the already created angular module
                var mainApp = angular.module("mainApp");
        }

        /*
                The survey controller. All survey related pages access this controller.
        */
        var SurveyCtrl = function ($scope, $http, $location, $window, $routeParams) {

                // Whenever a message is sent in a query string, save that in message variable.
                $scope.message = $location.search().msg;

                /*
                        Get all logged in user's survey and save it in the modules scope variable
                */
                var mySurvey = function() {
                        $http.get('/mysurveys').then(function(response) {
                                $scope.surveys = response.data;
                        });
                }

                /*
                        Get all response data for the survey (survey id is part of the url) and store it in a module variable
                */
                var responseData = function() {
                        $http.get('/surveys/' + $routeParams.id + '/response').then(function(response) {
                                var survey = response.data;
                                // This nested for loops is done just to format the response date to a nicer one
                                for(var i = 0 ; i < survey.questions.length ; i++) {
                                        var question = survey.questions[i];
                                        for(var j = 0 ; j < question.answers.length ; j++) {
                                                var answer = question.answers[j];
                                                for(var k = 0 ; k < answer.responses.length ; k++) {
                                                        // Save the nicer format date and correct locale time
                                                        survey.questions[i].answers[j].responses[k] = (new Date(answer.responses[k])).toLocaleString();
                                                }
                                        }
                                }
                                $scope.survey = survey;
                        });
                }

                /*
                        Get all active surveys. Activated and not yet expired surveys.
                */
                var allSurveys = function() {
                        $http.get('/surveys').then(function(response) {
                                $scope.surveys = response.data;
                        });
                }

                /*
                        Initialize the survey form
                */
                var surveyInit = function() {
                        $scope.currentDate = new Date();

                        // Set the date and time to current date and time
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

                        /*
                                The reason all of these functions work perfectly is the binding of the modules scope to the forms. Everytime a change is made here, they are reflected on the forms and vice versa
                        */

                        // Add new answer text boxes
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

                        // Remove answer text boxes
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

                        // Add a new question
                        $scope.addQuestion = function() {
                                $scope.questions.push({id: $scope.questions.length, answers: []});
                        }

                        // Remove a question
                        $scope.removeQuestion = function() {
                                $scope.questions.pop();
                        }
                }

                /*
                        Function that analyzes the results of an http request. Checks if there are error messages when a creation or update is done.
                */
                var analyzeResults = function(data, action) {
                        $scope.errors = new Array();
                        $scope.successMsg = null
                        // Show a success message if the http request does not return an error and is a success. Other wise, save all error messages
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


                // Create a new survey by sending an HTTP POST request with the data provided by the user
                var setupCreate = function() {
                        $scope.createSurvey = function() {
                                $http.post('/surveys', {
                                        survey: $scope.survey,
                                        questions: $scope.questions
                                })
                                .then(function(response) {
                                        // Call analyzeResults after the call has been made
                                        analyzeResults(response.data, "Created");
                                }, function(response){
                                        console.log(response);
                                });
                        }
                }

                // Setup the edit form.
                var setupEdit = function() {
                        $http.get('/surveys/' + $routeParams.id + '/response').then(function(response) {
                                var surveyData = response.data;
                                if(surveyData && surveyData._id) {
                                        // Set the module's survey variable to have the values from the Survey record coming from the db
                                        $scope.survey = {};
                                        $scope.survey._id = surveyData._id;
                                        $scope.survey.description = surveyData.description;
                                        $scope.survey.activation = new Date(surveyData.activation);
                                        $scope.survey.expiration = new Date(surveyData.expiration);

                                        $scope.questions = new Array();

                                        // Set the questions and answers to be shown in the survey form
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

                        // Edit an existing survey by sending an HTTP PUT request with the data provided by the user
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

                // This is the method called when the user decided to delete a survey he/she owns.
                var deleteSurveySetup = function() {
                        $scope.deleteSurvey = function(id) {
                                // A confirm alert must first be shown in order to make sure that the user does not accidentally delete a survey. Then make an HTTP DELETE request after the confirmation
                                if(confirm("Are you sure you want to delete this survey?")) {
                                        $http.delete('/surveys/'+id)
                                        .then(function(response) {
                                                analyzeResults(response.data, "Deleted");
                                                mySurvey();
                                        }, function(response){
                                                console.log(response);
                                        });
                                }
                        }
                }

                var setExport = function() {
                        // This method is used to get all the data to be used when exporting the report
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
                                return returnArr;
                        }
                }


                // Call the functions associated with what the user is trying to do or depending on the page the user is in.
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
                        setExport();
                }
                if ($("#respondPage").length > 0 || $("#reportPage").length > 0) {
                        responseData();

                }
        }

        mainApp.controller("SurveyCtrl", ["$scope", "$http", "$location", "$window", "$routeParams", SurveyCtrl]);
})();
