var passport = require('passport'),
        mongoose = require('mongoose');

module.exports = function() {
        var User = mongoose.model('User');

        var serialize = function(user, done) {
                done(null, user.id);
        }

        var deserialize = function(id, done) {
                User.find({"_id" : id}, "-password", function(err, user) {
                        done(err, user);
                });
        }

        passport.serializeUser(serialize);
        passport.deserializeUser(deserialize);
}
