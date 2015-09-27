var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        mongoose = require('mongoose');

module.exports = function() {
        var User = mongoose.model('User');

        var serialize = function(user, done) {
                done(null, user.id);
        }

        var deserialize = function(id, done) {
                User.find({"_id" : id}, "-password", function(error, user) {
                        done(error, user);
                });
        }

        passport.serializeUser(serialize);
        passport.deserializeUser(deserialize);


        passport.use(new LocalStrategy(function(username, password, done) {
                User.findOne({ username: username }, function(error, user) {
                        if (error) { return done(error); }
                        if (!user || !user.authenticate(password)) {
                                return done(null, false, { message: 'Invalid Username/Password Combination' });
                        }
                        return done(null, user);
                });
        }));
}
