/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var Survey = require('mongoose').model('Survey');

// Get the errors sent back by mongoose and organize these errors into an array of errors. This array will be used by Angular in displaying error messages to the user.
var getErrors = function(error, allErrors) {
        // If there is any error, check what errors are they and add the message into the errors array
        if(error.errors) {
                var errors = error.errors;
                if(errors.description) {
                        allErrors.push(errors.description.message);
                }
                if(errors.activation) {
                        allErrors.push(errors.activation.message);
                }
        }
        return allErrors;
}

/*
        Show all the active surveys. If a survey already expired, it will not be returned.
*/
exports.all = function(req, res) {
        var today = new Date();
        Survey.find({"activation" : {$lte: today}, "expiration" : {$gt: today}}).populate('user', 'username').exec(function(err, data) {
                res.json(data);
        });
}

/*
        When an edit or creation of a survey has been submitted, check if there is enough question and answer. Otherwise, return an error message to the user.

        questions: The questions from the client side form
        errorMessages: Error messages array from the edit or create route function. The same array is returned. A value is added everytime an error is spotted
*/
var checkQuestionAndAnswer = function(questions, errorMessages) {
        if(questions.length === 0) {
                errorMessages.push("Need to add at least one question.");
        } else {
                for(var i = 0; i < questions.length; i++) {
                        var question = questions[i];
                        // Check if the question text is empty
                        if(!(question.text) || question.text.length === 0) {
                                errorMessages.push("Question text must be added");
                        // Check if there's less than 2 answers. It doesn't make sense to have a question with only one or no answers.
                        } else if(question.answers.length < 2) {
                                errorMessages.push("Need to add at least two answers for: " + questions[i].text);
                        } else if(question.answers.length !== 0) {
                                // If there are more than one answers, check if these answers are not blank
                                for(var j = 0; j < question.answers.length; j++) {
                                        var answer = question.answers[j];
                                        if(!(answer.text) || answer.text.length === 0) {
                                                errorMessages.push("Answer text must be added");
                                        }
                                }
                        }
                }
        }

        return errorMessages;
}

/*
        RESTful Create function - the data from the client side form is used to save a new instance of a Survey Record Object into our database.
*/
exports.create = function(req, res) {
        var jsonData = req.body;

        // Validate whether we have sufficient amount of questions and answers
        var allErrors = checkQuestionAndAnswer(jsonData.questions, new Array());

        // Check if the user is logged in
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        // If there is an error, dont create a survey. Just return a json with the error information
        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                var surveyData = req.body.survey;

                // Create a new Survey Active record instance
                var survey = new Survey(surveyData);

                // Set the questions based on the questions added by the user in the create form
                survey.questions = jsonData.questions;
                // Set the owner's id based on the authenticated passport user's id
                survey.user = req.user[0]._id;
                // Save the new survey
                survey.save(function(error) {
                        // Return a json depending on how the saving worked. If there is an error on the mongoose side, these errors are returned to the client side for the user to see
                        if(error) {
                                // Get the error information using getErrors function
                                allErrors = getErrors(error, allErrors);
                                res.json({"success" : false, "errors" : allErrors});
                        } else {
                                // Return a success status as a rendered json file
                                res.json({"success" : true});
                        }
                });
        }
}

/*
        RESTful Update function - update a survey. This is called from the update form.
*/
exports.update = function(req, res) {
        var jsonData = req.body;

        // Validate whether we have sufficient amount of questions and answers
        var allErrors = checkQuestionAndAnswer(jsonData.questions, new Array());

        // Check if the user is logged in
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                var surveyData = req.body.survey;
                surveyData.questions = jsonData.questions;
                surveyData.user = req.user[0]._id;
                // Find by the survey id and make sure that the logged in user owns the survey then update
                Survey.update({"user" : req.user[0]._id, "_id" : surveyData._id}, {$set: surveyData}, function(error, data) {
                        // Just like in create method, return the error messages if an error occured after trying to save to db
                        if(error) {
                                allErrors = getErrors(error, allErrors);
                                res.json({"success" : false, "errors" : allErrors});
                        } else {
                                res.json({"success" : true});
                        }
                });
        }
}


/*
        RESTful Delete function - Delete a survey. Delete a survey owned by the logged in user.
*/
exports.delete = function(req, res) {
        var allErrors = new Array();;

        // Check if the user is logged in
        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                // Remove the survey if no errors are found.
                Survey.remove({"_id" : req.params.id, "user" : req.user[0]._id} , function(error, data) {
                        if(error) {
                                allErrors = getErrors(error, allErrors);
                                res.json({"success" : false, "errors" : allErrors});
                        } else {
                                res.json({"success" : true});
                        }
                });
        }
}

/*
        Return survey information from a specific survey. This is used by the report pages
*/
exports.response = function(req, res) {
        Survey.findById(req.params.id)
                .exec(function(error, data) {
                        if(error) {
                                res.json(error);
                        } else {
                                res.json(data);
                        }
                });
}

/*
        This is the route function used to submit a new response.
*/
exports.respond = function(req, res) {
        // Get the survey id and remove the key value pair
        var surveyId = req.body['surveyID'];
        delete req.body['surveyID'];
        // Find the survey based on it's survey id
        Survey.find({"_id":surveyId}).exec(function(error, data) {
                for(var i = 0 ; i < data.length ; i++) {
                        var survey = data[i];
                        for (var key in req.body){
                                // Add a response based on the key value pairs submitted by the user
                                var val = req.body[key];
                                var subdoc = survey.questions.id(key).answers.id(val);
                                subdoc.responses.push(Date.now());
                        }
                        // Save all the changes
                        survey.save();
                }
        });
        // Go to allsurveys page and show a response
        res.redirect('/allsurveys#/?msg=Successfully sent a response');
}


/*
        Only render in a json all the surveys owned by the currently logged in user. Even those that are not yet activated or already expired are returned.
*/
exports.mysurveys = function(req, res) {
        if(req.user && req.user[0]) {
                Survey.find({'user': req.user[0]._id}).populate('user', 'username').exec(function(err, data) {
                        res.json(data);
                });
        } else {
                res.redirect('/login');
        }
}


/*
        This route function is used to determine  whether to render the surveys page for non logged-in users or just redirect the user to home page in which all surveys are also shown.
*/
exports.surveysPage = function(req, res) {
        if(req.user) {
                res.redirect('/');
        } else {
                res.render('surveys');
        }
};
