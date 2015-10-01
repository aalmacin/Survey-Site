/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var User = require('mongoose').model('User');

var getErrors = function(error) {
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

exports.loggedin = function(req, res) {
        // Find all users
        var jsonData = req.body;

        var allErrors = new Array();

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

exports.updatePassword = function(req, res) {
        // Find all users
        var jsonData = req.body;

        var allErrors = new Array();
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        } else if(req.params.id != req.user[0]._id) {
                allErrors.push("You don't have access to this data");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
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

exports.update = function(req, res) {
        // Find all users
        var jsonData = req.body;

        var allErrors = new Array();
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        } else if(req.params.id != req.user[0]._id) {
                allErrors.push("You don't have access to this data");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
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

exports.delete = function(req, res) {
        User.findByIdAndRemove(req.params.id, function(error, data) {
                if(error) {
                        // Output the error messages
                        res.json({"messages" : getErrors(error)});
                } else {
                        if(data) {
                                // Return the user data. Only the id, email, and username is shown
                                res.json({
                                        "message": data.username + " has been deleted"
                                });
                        } else {
                                res.json({
                                        "message": "Can't find user to be deleted"
                                });
                        }
                }
        });
}

exports.registerPage = function(req, res) {
        if (!req.user) {
                res.render('register');
        } else {
                res.render('index');
        }
};

exports.loginPage = function(req, res) {
        if (!req.user) {
                res.render('login');
        } else {
                res.render('index');
        }
};

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

        user.provider = 'local';

        // Save the newly created user record
        user.save(function(error, data) {
                // After returning a duplicate key error, render a json with an error message
                if(error) {
                        // Output the error messages
                        res.json({"status": "error", "messages" : getErrors(error)});
                } else {
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


exports.logout = function(req, res) {
        req.logout();
        res.redirect('/login');
};

