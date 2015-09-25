/*
        The Route file for users. This is where the RESTful api for the user will be set along with other user related pages.
*/
var users = require('../controllers/users.server.controller');

module.exports = function(app) {
        app.route('/users')
                .get(users.all)
                .post(users.create);
}
