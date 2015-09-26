/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var Survey = require('mongoose').model('Survey'),
        Question = require('mongoose').model('Question'),
        Answer = require('mongoose').model('Answer');

var getErrors = function(error) {
        var messages = ["An error has occured"];
        console.log(error);
        return messages;
}

exports.all = function(req, res) {
        // Find all surveys
        // Populate the result to show questions and answers
        Survey.find({})
                .populate('_questions')
                .populate('_answers')
                .exec(function(error, data) {
                // Show a json page with the error message as the argument if an error is present. Otherwise, display the data.
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
        var errorData = [];

        // Save the newly created survey record
        survey.save(function(error, data) {
                // After returning a duplicate key error, render a json with an error message
                if(error) {
                        // Output the error messages
                        errorData.push({"messages" : getErrors(error)});
                } else {
                        // Return the survey data. Only the id, email, and surveyname is shown
                        for(var x = 0; x < jsonData.questions.length; x++) {
                                var question = jsonData.questions[x];

                                var newQuestion = new Question({
                                        "text" : question.text,
                                        "_survey" : data._id
                                });
                                survey._questions.push(newQuestion);
                                survey.save(function(error) {});

                                newQuestion.save(function(error, data) {
                                        // After returning a duplicate key error, render a json with an error message
                                        if(error) {
                                                // Output the error messages
                                                errorData.push({"messages" : getErrors(error)});
                                        } else {
                                                for(var y = 0; y < question.answers.length; y++) {
                                                        var answer = question.answers[y];

                                                        var newAnswer = new Answer({
                                                                "text" : answer.text,
                                                                "_question" : data._id
                                                        });
                                                        newQuestion._answers.push(newAnswer);
                                                        newQuestion.save(function(error) {});

                                                        newAnswer.save(function(error, data) {
                                                                if(error) {
                                                                        // Output the error messages
                                                                        errorData.push({"messages" : getErrors(error)});
                                                                }
                                                        });
                                                }
                                        }
                                });
                        }
                }
        });

        if(errorData.length > 0) {
                res.json(errorData);
        } else {
                res.json(jsonData);
        }
}

exports.update = function(req, res) {
}

exports.delete = function(req, res) {
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

exports.response = function(req, res) {
}

exports.respond = function(req, res) {
        Survey.findById(req.params.id)
                .populate('_questions')
                .populate('_answers')
                .exec(function(error, data) {
                        console.log(data);
                        /*
                        for (var x=0; x < data.questions.length; x++) {
                                var question = data.questions[x];
                                if (question._id.toString() === req.params.questionid) {
                                        for (var y=0; y < question.answers.length; y++) {
                                                console.log(question.answers[y]);
                                        }
                                }
                        }
                        */
                });
}
