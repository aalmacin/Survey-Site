/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var User = require('mongoose').model('User');

// Get the errors sent back by mongoose and organize these errors into an array of errors. This array will be used by Angular in displaying error messages to the user.
var getErrors = function(error) {
        // Show a generic error message
        var messages = ["An error has occured"];
        if(error.errors && error.errors.password && error.errors.password.message) {
                messages.push(error.errors.password.message);
        }
        if(error.code === 11000 || error.code === 11001) {

                // Add an error message regarding existing email or username before save.
                if(error.message.indexOf("username") > -1) {
                        messages.push("The username has been taken");
                }
                if(error.message.indexOf("email") > -1) {
                        messages.push("The email has been taken");
                }
        }
        return messages;
}

/*
        This RESTful Read method is used to show all users in JSON format
*/
exports.all = function(req, res) {
        // Find all users
        User.find({}, '-password -__v', function(error, data) {
                // Run the next middleware with the error message as the argument if an error is present. Otherwise, display the data.
                if(error) {
                        res.json(error);
                } else {
                        res.json(data);
                }
        });
}

/*
        Returns the logged in user data
*/
exports.loggedin = function(req, res) {
        // Find all users
        var jsonData = req.body;

        var allErrors = new Array();

        // Check if the user is logged in
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                User.find({"_id" : req.user[0]._id}, '-password -__v', function(error, data) {
                        // Run the next middleware with the error message as the argument if an error is present. Otherwise, display the data.
                        if(error) {
                                res.json(error);
                        } else {
                                res.json(data);
                        }
                });
        }
}

/*
        This method is used to update the user's password
*/
exports.updatePassword = function(req, res) {
        // Find all users
        var jsonData = req.body;

        var allErrors = new Array();

        // Check if the user is logged in
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        // Find out if the userid sent is the logged in user with the right id. This is to prevent people who uses bash to just send a request using curl
        } else if(req.params.id != req.user[0]._id) {
                allErrors.push("You don't have access to this data");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                // Find the user and update the password
                User.findOne({"_id" : req.params.id}).exec( function(error, data) {
                        data.password = req.body.password;
                        data.save(function(error, data) {
                                if(error) {
                                        // Output the error messages
                                        res.json({success: false, "messages" : getErrors(error)});
                                } else {
                                        // Return the user data. Only the id, email, and username is shown
                                        res.json({
                                                "success": true,
                                                "username": data.username,
                                                "email": data.email,
                                                "id": data._id
                                        });
                                }
                        });
                });
        }
}

/*
        This method is used to update the user's information. Email/username
*/
exports.update = function(req, res) {
        // Find all users
        var jsonData = req.body;

        var allErrors = new Array();

        // Check if the user is logged in
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        // Find out if the userid sent is the logged in user with the right id. This is to prevent people who uses bash to just send a request using curl
        } else if(req.params.id != req.user[0]._id) {
                allErrors.push("You don't have access to this data");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                // Update the user info
                User.findByIdAndUpdate(req.params.id, {$set: req.body.user}, function(error, data) {
                        if(error) {
                                // Output the error messages
                                res.json({"messages" : getErrors(error)});
                        } else {
                                // Return the user data. Only the id, email, and username is shown
                                res.json({
                                        "success": true,
                                        "username": data.username,
                                        "email": data.email,
                                        "id": data._id
                                });
                        }
                });
        }
}

// Render registration page. Show the registration view page only if the user is not logged in
exports.registerPage = function(req, res) {
        if (!req.user) {
                res.render('register');
        } else {
                res.render('index');
        }
};

// Render login page. Show the login view page only if the user is not logged in
exports.loginPage = function(req, res) {
        if (!req.user) {
                res.render('login');
        } else {
                res.render('index');
        }
};

// Render index page. Force the user to login by going to the login page if the user is not yet logged in
exports.main = function(req, res) {
        if (!req.user) {
                res.render('login');
        } else {
                res.render('index');
        }
};

// Using the User model, create a new user using the json data passed (using body-parser) from the form.
exports.register = function(req, res) {
        var user = new User(req.body);

        // Set provider to local. This will be saved to the database
        user.provider = 'local';

        // Save the newly created user record
        user.save(function(error, data) {
                // After returning a duplicate key error, render a json with an error message
                if(error) {
                        // Output the error messages
                        res.json({"status": "error", "messages" : getErrors(error)});
                } else {
                        // Login the user immediately after registration
                        req.login(user, function(error) {
                                if(error) {
                                        res.json({"status": "error", "messages" : getErrors(error)});
                                } else {
                                        res.json({"status" : "success"});
                                }
                        });
                }
        });
}

// Logout the user from the site (using passport) and redirect the user to the login page
exports.logout = function(req, res) {
        req.logout();
        res.redirect('/login');
};

