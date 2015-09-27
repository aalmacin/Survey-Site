/*
        The Route file for users. This is where the RESTful api for the user will be set along with other user related pages.
*/
var users = require('../controllers/users.server.controller');

module.exports = function(app) {
        app.route('/users')
                .get(users.all)
                .post(users.register);
        app.route('/users/:id')
                .put(users.update)
                .delete(users.delete);
        app.route('/register')
                .get(users.register);
        app.route('/').get(users.index);
        app.route('/login')
                .get(users.login);
}
