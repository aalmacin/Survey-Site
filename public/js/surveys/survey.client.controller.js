(function() {
        var mainApp = angular.module("mainApp");

        var SurveyCtrl = function ($scope, $http, $window) {
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

        mainApp.controller("SurveyCtrl", ["$scope", "$http", "$window", SurveyCtrl]);
})();
