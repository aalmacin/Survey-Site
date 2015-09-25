/*
        Create the model for the user. Other User related database methods are also added in here.
*/
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
        username: {
                type: String,
                unique: true,
                required: "Username required"
        },
        password: {
                type: String,
                required: "Password required"
        },
        email: {
                type: String,
                unique: true,
                required: "Email required"
        }
});

mongoose.model('User', UserSchema);
