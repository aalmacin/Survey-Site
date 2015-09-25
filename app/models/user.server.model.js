/*
        Create the model for the user. Other User related database methods are also added in here.
*/
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
        username: {
                type: String
        },
        password: {
                type: String
        },
        email: {
                type: String
        }
});

mongoose.model('User', UserSchema);
