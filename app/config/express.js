/*
        All the express configuration setup will be done here
*/
var express = require('express');

module.exports = function(mongoose) {
        var db = mongoose();
        var app = express();

        // Add all the route files to the configuration.
        require('../routes/users.server.routes.js')(app);

        return app;
}
