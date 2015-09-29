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

exports.create = function(req, res) {
        var jsonData = req.body;
        // Initialize error messages
        var errorMessages = checkQuestionAndAnswer(jsonData.questions, new Array());

        // If user does not exists, send this error message.
        if(!req.user || !req.user[0]) {
                errorMessages.push("Need to login first");
        }

        if(jsonData.survey.activation.length === 0) {
                errorMessages.push("Activation needed");
        }

        if(jsonData.survey.expiration.length === 0) {
                errorMessages.push("Expiration needed");
        }

        if(jsonData.survey.description.length === 0) {
                errorMessages.push("Description needed");
        }

        if (errorMessages.length === 0) {

                var userId = req.user[0]._id;
                var survey = new Survey({
                        '_owner' : userId,
                        'activation' : jsonData.survey.activation,
                        'expiration' : jsonData.survey.expiration,
                        'description' : jsonData.survey.description
                });

                for(var i=0; i < jsonData.questions.length; i++) {
                        var questionData = jsonData.questions[i];
                        var question = new Question({
                                "_survey" : survey._id,
                                "text" : questionData.text
                        });

                        for(var j=0; j < questionData.answers.length; j++) {
                                var answerData = questionData.answers[j];
                                var answer = new Answer({
                                        "_question" : question._id,
                                        "text" : answerData.text
                                });
                                question._answers.push(answer);
                                answer.save();
                        }
                        question.save();
                        survey._questions.push(question);
                }
                survey.save();
                res.json({"success" : true, "messages" : jsonData});
        } else {
                res.json({"success" : false, "messages" : errorMessages});
        }
}

exports.update = function(req, res) {
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
