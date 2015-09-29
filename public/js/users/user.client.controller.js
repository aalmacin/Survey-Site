(function() {
        var mainApp = angular.module("mainApp");

        var UserCtrl = function ($scope, $http, $window) {
                $scope.errors = [];
                if($("#editUserPage").length > 0) {
                        $http.get('/loggedin').then(function(response) {
                                var userData = response.data[0];
                                $scope.user = {};
                                $scope.user._id = userData._id;
                                $scope.user.email = userData.email;
                                $scope.user.username = userData.username;
                        });
                        $scope.updateInfo = function() {
                                $scope.errors = [];
                                $http.put('/users/'+$scope.user._id, {
                                        user: {
                                                email : $scope.user.email,
                                                username : $scope.user.username
                                        }
                                })
                                .then(function(response) {
                                        console.log(response);

                                }, function(response){
                                        console.log(response);
                                });
                        }

                        $scope.updatePassword = function() {
                                $scope.errors = [];
                                if($scope.user.password === $scope.user.confirmPassword) {
                                        $http.put('/users/' + $scope.user._id + '/password', {
                                                password : $scope.user.password
                                        })
                                        .then(function(response) {
                                                console.log(response);
                                                $scope.errors = new Array();
                                                $scope.successMsg = null
                                                if(response.data.success) {
                                                        $scope.successMsg = "Successfully Updated user.";
                                                } else {
                                                        $scope.errors = response.data.errors;
                                                }

                                        }, function(response){
                                                console.log(response);
                                        });
                                } else {
                                        $scope.errors.push("Password did not match confirmation.");
                                        $scope.user.password = "";
                                        $scope.user.confirmPassword = "";
                                }
                        }
                }
        }

        mainApp.controller("UserCtrl", ["$scope", "$http", "$window", UserCtrl]);
})();
