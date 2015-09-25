/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var User = require('mongoose').model('User');

exports.all = function(req, res, next) {
        // Find all users
        User.find({}, function(err, data) {
                // Run the next middleware with the error message as the argument if an error is present. Otherwise, display the data.
                if(err) {
                        next(err);
                } else {
                        res.json(data);
                }
        });
}
