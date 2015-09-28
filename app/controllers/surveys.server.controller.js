/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var Survey = require('mongoose').model('Survey'),
        Question = require('mongoose').model('Question'),
        Answer = require('mongoose').model('Answer');

var getErrors = function(error) {
        var messages = [];
        if(error.errors && error.errors.description && error.errors.description.message) {
                messages.push(error.errors.description.message);
        }
        if(error.errors.length > 0) {
                for(var i = 0; i < error.errors.length; i++) {
                        messages.push(error.errors[i]);
                }
        }

        if(messages.length === 0) messages.push("An error has occured");
        return messages;
}

exports.all = function(req, res) {
        Survey.find({})
                .populate('_owner', 'username')
                .deepPopulate('answers')
                .exec(function(error, data) {
                if(error) {
                        res.json(error);
                } else {
                        res.json(data);
                }
        });
}

var createQuestions = function(id, data) {
        var question = new Question(data);
        question.save(function(error) {
                if(error) question = getErrors(error);
        });
        return question;
}

var createAnswers = function(id, data) {
        var answer = new Answer(data);
        answer.save(function(error) {
                if(error) answer = getErrors(error);
        });
        return answer;
}

var checkQuestionAndAnswer = function(questions, errorMessages) {
        if(questions.length === 0) {
                errorMessages.push("Need to add at least one question.");
        } else {
                for(var i = 0; i < questions.length; i++) {
                        var question = questions[i];
                        if(question.text.length === 0) {
                                errorMessages.push("Question text must be added");
                        } else if(question.answers.length < 2) {
                                errorMessages.push("Need to add at least two answers for: " + questions[i].text);
                        } else if(question.answers.length !== 0) {
                                for(var j = 0; j < question.answers.length; j++) {
                                        var answer = question.answers[j];
                                        if(answer.text.length === 0) {
                                                errorMessages.push("Answer text must be added");
                                        }
                                }
                        }
                }
        }

        return errorMessages;
}

var getErrorArray = function(errorMessages, errors) {
        for(var i = 0; i < errors.length ; i++) {
                errorMessages.push(errors[i]);
        }
        return errorMessages;
}

// Using the Survey model, create a new survey using the json data passed (using body-parser) from the form.
exports.create = function(req, res) {
        // Initialize error messages
        var errorMessages = checkQuestionAndAnswer(req.body.questions, new Array());

        // If user does not exists, send this error message.
        if(!req.user || !req.user[0]) {
                errorMessages.push("Need to login first");
        }

        if(errorMessages.length === 0) {
                var surveyData = req.body;
                surveyData.survey._owner = req.user[0]._id;

                var survey = new Survey(surveyData.survey);
                survey.save(function(error) {
                        if(error) {
                                errorMessages = getErrorArray(errorMessages, getErrors(error));
                                res.json({"error" : true, "errors" : errorMessages});
                        } else {
                                if (survey._id && surveyData.questions.length > 0) {
                                        for (var i=0; i < surveyData.questions.length; i++) {
                                                var questionJSON = surveyData.questions[i];

                                                var question = createQuestions(survey._id, {
                                                        "text" : questionJSON.text,
                                                        "_survey" : survey._id
                                                });

                                                if (question._id) {
                                                        for (var j=0; j < questionJSON.answers.length; j++) {
                                                                var answerJSON = questionJSON.answers[j];

                                                                var answer = createAnswers(question._id, {
                                                                        "text" : answerJSON.text,
                                                                        "_question" : question._id
                                                                });

                                                                if (!question._id) {
                                                                        errorMessages = getErrorArray(errorMessages, getErrors(answer));
                                                                        res.json({"error" : true, "errors" : errorMessages});
                                                                }
                                                                question._answers.push(answer);
                                                        }
                                                        question.save(function(err) {
                                                                if(err) {
                                                                        errorMessages = getErrorArray(errorMessages, getErrors(err));
                                                                        res.json({"error" : true, "errors" : errorMessages});
                                                                }
                                                        });
                                                        survey._questions.push(question);
                                                } else {
                                                        errorMessages = getErrorArray(errorMessages, getErrors(question));
                                                        res.json({"error" : true, "errors" : errorMessages});
                                                }
                                        }
                                        survey.save(function(err) {
                                                if(err) {
                                                        errorMessages = getErrorArray(errorMessages, getErrors(err));
                                                        res.json({"error" : true, "errors" : errorMessages});
                                                }
                                        });
                                }


                                if (errorMessages.length === 0) {
                                        res.json(req.body);
                                }
                        }
                });
        } else {
                res.json({"error" : true, "errors" : errorMessages});
        }
}

exports.update = function(req, res) {
        var errorMessages = new Array();
        // If user does not exists, send this error message.
        if(!req.user || !req.user[0]) {
                errorMessages.push("Need to login first");
        }

        if(errorMessages.length === 0) {
                var callback = function(error, data) {
                        if(error) {
                                // Output the error messages
                                res.json({"messages" : getErrors(error)});
                        } else {
                                // Return the user data. Only the id, email, and username is shown
                                res.json({
                                        "messages" : "Successfully updated survey"
                                });
                        }
                };

                switch(req.params.model) {
                        case 'survey':
                                Survey.findByIdAndUpdate(req.params.id, { $set: req.body }, callback);
                                break;
                        case 'question':
                                Question.findByIdAndUpdate(req.params.id, { $set: req.body }, callback);
                                break;
                        case 'answer':
                                Answer.findByIdAndUpdate(req.params.id, { $set: req.body }, callback);
                                break;
                }
        }
}

exports.delete = function(req, res) {
        Survey.findById(req.params.id)
        .populate('answers').exec(function(error, data) {
                for(var i = 0; i < data._questions.length; i++) {
                        Answer.remove({"_question" : data._questions[i]}, function(error) {});
                }
                Question.remove({"_survey" : data._id}, function(error) {});
                Survey.findByIdAndRemove(data._id, function(error) {});
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

exports.surveysPage = function(req, res) {
        if(req.user) {
                res.redirect('/');
        } else {
                res.render('surveys');
        }
};

exports.response = function(req, res) {
        Survey.findById(req.params.id)
                .deepPopulate('answers')
                .exec(function(error, data) {
                if(error) {
                        res.json(error);
                } else {
                        res.json(data);
                }
        });
}

exports.respond = function(req, res) {

        for (var k in req.body){
                Answer.findByIdAndUpdate(req.body[k], {$push: {"responses": Date.now()}}, function(error, data) {

                        if(error)
                                console.log({"messages" : getErrors(error)});
                        else
                                console.log(data);
                });
        }
        res.redirect('/allsurveys#/?msg=Successfully sent a response');
}

exports.mysurveys = function(req, res) {
        if(req.user && req.user[0]) {
                Survey.find({'_owner' : req.user[0]._id})
                        .populate('_owner', 'username')
                        .deepPopulate('answers')
                        .exec(function(error, data) {
                        if(error) {
                                res.json(error);
                        } else {
                                res.json(data);
                        }
                });
        } else {
                res.json({"messages" : "Need to login"});
        }
}
