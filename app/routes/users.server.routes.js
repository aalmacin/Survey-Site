/*
        The Route file for users. This is where the RESTful api for the user will be set along with other user related pages.
*/
var users = require('../controllers/users.server.controller'),
        passport = require('passport');

module.exports = function(app) {
        app.route('/users')
                .get(users.all)
                .post(users.register);
        app.route('/users/:id')
                .put(users.update)
                .delete(users.delete);
        app.get('/', users.main);
        app.route('/login')
                .get(users.loginPage)
                .post(passport.authenticate('local', {
                        successRedirect: '/',
                        failureRedirect: '/login'
                }));
        app.route('/register')
                .get(users.registerPage)
                .post(users.register);
        app.get('/logout', users.logout);
}
