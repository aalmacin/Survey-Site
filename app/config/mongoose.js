/*
        Configuration file for mongoose.
*/
var config = require('./config'),
        mongoose = require('mongoose');

module.exports = function() {
        var db = mongoose.connect(config.dbPath);

        // Add all the model schemas
        require('../models/user.server.model.js');
        require('../models/survey.server.model.js');
        return db;
}
