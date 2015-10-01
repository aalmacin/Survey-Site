/*
        The Route file for users. This is where the RESTful api for the user will be set along with other user related pages.
*/
var users = require('../controllers/users.server.controller'),
        passport = require('passport');

module.exports = function(app) {
        // Create a new user using register.
        app.route('/users')
        // Hidden the get method. There is no usage for this method at the moment
        //        .get(users.all)
                .post(users.register);
        // Get the logged in user's data
        app.route('/loggedin')
                .get(users.loggedin);
        // Update the user's password
        app.route('/users/:id/password')
                .put(users.updatePassword);
        // Update the user's info
        app.route('/users/:id')
                .put(users.update);
        // Render the main view
        app.get('/', users.main);
        // Render the login view
        app.get('/login', users.loginPage);

        // login the user. This is a passport function
        app.post('/login', function(req, res, next) {
                passport.authenticate('local', function(error, user, info) {
                        if (error) { return next(error); }
                        if (! user) {
                                return res.send({ success : false, message : 'The Username/Password combination did not match.' });
                        }
                        req.login(user, function(error) {
                                if(error) {
                                        res.send({success: false, "messages" : getErrors(error)});
                                } else {
                                        return res.send({ success : true, message : 'Logged in ' + user.username });
                                }
                        });
                })(req, res, next);
        });

        // Render the register page or register a new user
        app.route('/register')
                .get(users.registerPage)
                .post(users.register);
        // logout the current logged in user
        app.get('/logout', users.logout);
}
