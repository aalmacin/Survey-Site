/*
        All the express configuration setup will be done here
*/
var express = require('express'),
        methodOverride = require('method-override'),
        passport = require('passport'),
        bodyParser = require('body-parser');

module.exports = function(mongoose) {
        var db = mongoose();
        var app = express();

        // Set the app to use body parser and make the files passed to the request (req.body) a json object
        app.use(methodOverride());
        app.use(bodyParser.json());

        // Setup our app to use passport middlewares
        app.use(passport.initialize());
        app.use(passport.session());

        // Add all the route files to the configuration.
        require('../routes/users.server.routes.js')(app);
        require('../routes/surveys.server.routes.js')(app);

        return app;
}
