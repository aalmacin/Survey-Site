/*
        This file contains the main setup for the site. All the different configurations and cleaning up are to be run here.
*/
module.exports = function() {
        this.mongoose = require('./config/mongoose');
        this.app = require('./config/express')(this.mongoose);

        // This function is used to set the environment variable if an environment variable does not exist in the server. The default environment variable is dev.
        this.setEnvironmentVars = function() {
                process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
        }

        // The application will run after calling this method
        this.start = function(port, ip) {
                this.app.listen(port, ip);
        }

        // Return an instance of this object
        return this;
}

