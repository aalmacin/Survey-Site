/*
        Setup passport.js

        Passport is used for logging in and out of the site. Local strategy is used by the web application but other OAuth strategies could also be used. Facebook, twitter, google+ etc.
*/
var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        mongoose = require('mongoose');

module.exports = function() {
        // Look for the User model and we'll use it for the authentication
        var User = mongoose.model('User');

        /*
                Serialize method are used to store the user value to the session everytime a login is made.
        */
        var serialize = function(user, done) {
                done(null, user.id);
        }

        /*
                Deserialize when the current user is not valid to be logged in.
        */
        var deserialize = function(id, done) {
                User.find({"_id" : id}, "-password", function(error, user) {
                        done(error, user);
                });
        }

        passport.serializeUser(serialize);
        passport.deserializeUser(deserialize);


        // Set passport to use LocalStrategy for logging in users
        passport.use(new LocalStrategy(function(username, password, done) {
                // Find the user with the given username
                User.findOne({ username: username }, function(error, user) {
                        if (error) { return done(error); }
                        // Check if the password given matches the user's password. The user is found through it's username
                        // If there's a match, serialize the user. If not,return an error message
                        if (!user || !user.authenticate(password)) {
                                return done(null, false, { message: 'Invalid Username/Password Combination' });
                        }
                        return done(null, user);
                });
        }));
}
