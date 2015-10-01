(function() {
        var mainApp = angular.module("mainApp");

        var UserCtrl = function ($scope, $http, $window) {
                $scope.errors = [];
                /*
                        If the user is on the edit user page, set the form data to have the user's info
                */
                if($("#editUserPage").length > 0) {
                        $http.get('/loggedin').then(function(response) {
                                var userData = response.data[0];
                                $scope.user = {};
                                $scope.user._id = userData._id;
                                $scope.user.email = userData.email;
                                $scope.user.username = userData.username;
                        });
                        // When the user submits the form, make an api call to update the user's info
                        $scope.updateInfo = function() {
                                $scope.errors = [];
                                $scope.successMsg = '';
                                $http.put('/users/'+$scope.user._id, {
                                        user: {
                                                email : $scope.user.email,
                                                username : $scope.user.username
                                        }
                                })
                                .then(function(response) {
                                        if(response.data && response.data.success) {
                                                $scope.successMsg = "Successfully Updated User info";
                                        } else {
                                                $scope.errors = response.data.errors;
                                        }

                                }, function(response){
                                        console.log(response);
                                });
                        }

                        // When the user submits the form, make an api call to update the user's password
                        $scope.updatePassword = function() {
                                $scope.errors = [];
                                $scope.successMsg = '';
                                // Check if the password matches the confirmation
                                if($scope.user.password === $scope.user.confirmPassword) {
                                        $http.put('/users/' + $scope.user._id + '/password', {
                                                password : $scope.user.password
                                        })
                                        .then(function(response) {
                                                if(response.data && response.data.success) {
                                                        $scope.successMsg = "Successfully Updated User password";
                                                        // reset the password text boxes
                                                        $scope.user.password = "";
                                                        $scope.user.confirmPassword = "";
                                                } else {
                                                        $scope.errors = response.data.messages;
                                                }
                                        }, function(response){
                                                console.log(response);
                                        });
                                } else {
                                        // Show an error and reset the password text boxes
                                        $scope.errors.push("Password did not match confirmation.");
                                        $scope.user.password = "";
                                        $scope.user.confirmPassword = "";
                                }
                        }
                }
        }

        mainApp.controller("UserCtrl", ["$scope", "$http", "$window", UserCtrl]);
})();
