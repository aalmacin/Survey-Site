// The file run by the nodemon/node commands
var Server = require('./app/main.server.application')();
Server.start(3000, 'localhost');
