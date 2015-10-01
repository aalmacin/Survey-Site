/*
        All the express configuration setup will be done here
*/
var express = require('express'),
        methodOverride = require('method-override'),
        passport = require('passport'),
        config = require('./config'),
        session = require('express-session'),
        bodyParser = require('body-parser');

module.exports = function(mongoose) {
        // Require jade for server-side view templating.
        require('jade');

        // Mongoose and express are initialized
        var db = mongoose();
        var app = express();

        // Set the app to use body parser and make the files passed to the request (req.body) a json object
        app.use(methodOverride());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
                extended: true
        }));

        // Set the view engine to jade. EJS is another good choice.
        app.set('views', './app/views');
        app.set('view engine', 'jade');

        // Set the session to be used by the application
        app.use(session({
                saveUninitialized: true,
                resave: true,
                secret: config.secret
        }));

        // Setup our app to use passport middlewares
        app.use(passport.initialize());
        app.use(passport.session());

        // Add all the route files to the configuration.
        require('../routes/users.server.routes.js')(app);
        require('../routes/surveys.server.routes.js')(app);

        // Make sure that we make the public folder accessible. If this is not set, when trying to access client side files, it will be treated as part of the express routing.
        app.use('/', express.static('./public'));

        return app;
}
