/*
        Configuration file for mongoose.
*/
var config = require('./config'),
        mongoose = require('mongoose');

module.exports = function() {
        // Set which db to connect to depending on the path taken from the respective config file
        var db = mongoose.connect(config.dbPath);

        // Add all the model schemas
        require('../models/user.server.model.js');
        require('../models/survey.server.model.js');
        return db;
}
