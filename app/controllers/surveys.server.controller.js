/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var Survey = require('mongoose').model('Survey'),
        Question = require('mongoose').model('Question'),
        Answer = require('mongoose').model('Answer');

var getErrors = function(error) {
        var messages = ["An error has occured"];
        console.log('Here');
        console.log(error);
        return messages;
}

exports.all = function(req, res) {
        // Find all surveys
        Survey.find({}, function(error, data) {
                // Run the next middleware with the error message as the argument if an error is present. Otherwise, display the data.
                if(error) {
                        res.json(error);
                } else {
                        res.json(data);
                }
        });
}

// Using the Survey model, create a new survey using the json data passed (using body-parser) from the form.
exports.create = function(req, res) {
        var jsonData = req.body;
        var survey = new Survey(jsonData.survey);

        survey.questions = new Array();

        for(var x in jsonData.questions) {
                var question = jsonData.questions[x];

                var newQuestion = new Question({
                        "text" : question.text
                });


                for(var y in question.answers) {
                        var answer = question.answers[y];

                        var newAnswer = new Answer({
                                "text" : answer.text
                        });

                        newQuestion.answers.push(newAnswer);
                }


                survey.questions.push(newQuestion);
        }


        // Save the newly created survey record
        survey.save(function(error, data) {
                // After returning a duplicate key error, render a json with an error message
                if(error) {
                        // Output the error messages
                        res.json({"messages" : getErrors(error)});
                } else {
                        // Return the survey data. Only the id, email, and surveyname is shown
                        res.json({
                                "survey": data
                        });
                }
        });
}

exports.update = function(req, res) {
}

exports.delete = function(req, res) {
        console.log(req.params.id);
        Survey.findByIdAndRemove(req.params.id, function(error, data) {
                if(error) {
                        // Output the error messages
                        res.json({"messages" : getErrors(error)});
                } else {
                        if(data) {
                                // Return the survey data. Only the id, email, and surveyname is shown
                                res.json({
                                        "message": "Survey has been deleted"
                                });
                        } else {
                                res.json({
                                        "message": "Can't find survey to be deleted"
                                });
                        }
                }
        });
}
