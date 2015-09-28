(function() {
        var mainApp = angular.module("mainApp");

        var SurveyCtrl = function ($scope, $http, $window) {
                $scope.questions = [];

                var createSurvey = function() {
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
                        question.answers.push({id: question.answers.length});
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
