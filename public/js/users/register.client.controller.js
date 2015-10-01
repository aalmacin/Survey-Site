(function() {
        var mainApp = angular.module("mainApp", ["ngMessages"]);

        var RegistrationCtrl = function ($scope, $http, $window) {
                $scope.registrationUser = {};
                $scope.errors = [];

                // Make an api call to registration after a form submit and then login the user if successful.
                $scope.register = function() {
                        $scope.errors = [];
                        if($scope.registrationUser.password === $scope.registrationUser.confirmPassword) {
                                $http.post('/register', $scope.registrationUser).then(function(response) {
                                        if(response.data.status === 'error') {
                                                $scope.errors = response.data.messages;
                                        } else {
                                                // Reload to let the backend determine which view to render
                                                $window.location.reload();
                                        }
                                });
                        } else {
                                $scope.errors.push("Password did not match confirmation.");
                        }
                }
          }
          mainApp.controller("RegistrationCtrl", ["$scope", "$http", "$window", RegistrationCtrl]);
}());
