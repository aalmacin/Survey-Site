/*
        Create the model for the user. Other User related database methods are also added in here.
*/
var mongoose = require('mongoose'),
        bcrypt = require('bcrypt-nodejs');

/*
        Simple length validation methods are added
*/
var validatePasswordMin = function(password) {
        return password && password.length > 6;
}

var validatePasswordMax = function(password) {
        return password && password.length <= 20;
}

/*
        Validate whether the user has at least one Uppercase, Lowercase, and number
*/
var validatePasswordCharacters = function(password) {
        return password.match(new RegExp('[A-Z]')) && password.match(new RegExp('[a-z]')) && password.match(new RegExp('[0-9]'));
}

var UserSchema = new mongoose.Schema({
        username: {
                type: String,
                unique: true,
                trim: true,
                required: "Username required"
        },
        password: {
                type: String,
                required: "Password required",
                // Set the validators
                validate: [
                        {"validator": validatePasswordMin, "msg": 'Password must be longer'},
                        {"validator": validatePasswordMax, "msg": 'Password must not be longer than 20 characters'},
                        {"validator": validatePasswordCharacters, "msg": 'Password must contain at least one lower case, upper case, number or symbol.'}
                ]
        },
        provider: {
                type: String,
                required: 'Provider is required'
        },
        email: {
                type: String,
                unique: true,
                match: [/.+\@.+\..+/, "Please fill a valid e-mail address"],
                required: "Email required"
        }
});


// Before saving the user, hash the password first using bcrypt
UserSchema.pre('save', function(next) {
        this.password = this.hashPassword(this.password);
        next();
});

// Use this method to check if the password sent matches the hashed password
UserSchema.methods.authenticate = function(pwd) {
        return bcrypt.compareSync(pwd, this.password);
}

// Method to hash the password
UserSchema.methods.hashPassword = function(pwd) {
        return bcrypt.hashSync(pwd);
}

mongoose.model('User', UserSchema);
