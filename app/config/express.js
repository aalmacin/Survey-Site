/*
        All the express configuration setup will be done here
*/
var express = require('express');

module.exports = function(mongoose) {
        var db = mongoose();
        var app = express();



        return app;
}
