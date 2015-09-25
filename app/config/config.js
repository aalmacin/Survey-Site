// Check for the environment folder and return the right configuration object depending on the environment the server is in.
module.exports = require('./env/'+process.env.NODE_ENV+'.js');
