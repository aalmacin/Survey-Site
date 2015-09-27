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
        app.get('/login', users.loginPage);

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

        app.route('/register')
                .get(users.registerPage)
                .post(users.register);
        app.get('/logout', users.logout);
}
