// The file run by the nodemon/node commands
var Server = require('./app/main.server.application')();
var port = process.env.PORT || 3000;
var host = process.env.HOST || 'localhost';
Server.start(port, host);
