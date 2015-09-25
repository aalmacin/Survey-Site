/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var User = require('mongoose').model('User');

var getErrors = function(error) {
        var messages = ["An error has occured"];
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
        User.find({}, function(error, data) {
                // Run the next middleware with the error message as the argument if an error is present. Otherwise, display the data.
                if(error) {
                        res.json(error);
                } else {
                        res.json(data);
                }
        });
}

// Using the User model, create a new user using the json data passed (using body-parser) from the form.
exports.create = function(req, res) {
        var user = new User(req.body);

        // Save the newly created user record
        user.save(function(error, data) {
                // After returning a duplicate key error, render a json with an error message
                if(error) {
                        // Output the error messages
                        res.json({"messages" : getErrors(error)});
                } else {
                        // Return the user data. Only the id, email, and username is shown
                        res.json({
                                "username": data.username,
                                "email": data.email,
                                "id": data._id
                        });
                }
        });
}

exports.update = function(req, res) {
        User.findByIdAndUpdate(req.params.id, {
                $set: req.body
        }, function(error, data) {
                if(error) {
                        // Output the error messages
                        res.json({"messages" : getErrors(error)});
                } else {
                        // Return the user data. Only the id, email, and username is shown
                        res.json({
                                "username": data.username,
                                "email": data.email,
                                "id": data._id
                        });
                }
        });
}
