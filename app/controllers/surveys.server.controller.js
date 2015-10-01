/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var Survey = require('mongoose').model('Survey');

var getErrors = function(error, allErrors) {
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

exports.all = function(req, res) {
        var today = new Date();
        Survey.find({"activation" : {$lte: today}, "expiration" : {$gt: today}}).populate('user', 'username').exec(function(err, data) {
                res.json(data);
        });
}

var checkQuestionAndAnswer = function(questions, errorMessages) {
        if(questions.length === 0) {
                errorMessages.push("Need to add at least one question.");
        } else {
                for(var i = 0; i < questions.length; i++) {
                        var question = questions[i];
                        if(!(question.text) || question.text.length === 0) {
                                errorMessages.push("Question text must be added");
                        } else if(question.answers.length < 2) {
                                errorMessages.push("Need to add at least two answers for: " + questions[i].text);
                        } else if(question.answers.length !== 0) {
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

exports.create = function(req, res) {
        var jsonData = req.body;

        var allErrors = checkQuestionAndAnswer(jsonData.questions, new Array());

        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                var surveyData = req.body.survey;

                var survey = new Survey(surveyData);
                survey.questions = jsonData.questions;
                survey.user = req.user[0]._id;
                survey.save(function(error) {
                        if(error) {
                                allErrors = getErrors(error, allErrors);
                                res.json({"success" : false, "errors" : allErrors});
                        } else {
                                res.json({"success" : true});
                        }
                });
        }
}

exports.update = function(req, res) {
        var jsonData = req.body;

        var allErrors = checkQuestionAndAnswer(jsonData.questions, new Array());

        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
                var surveyData = req.body.survey;
                surveyData.questions = jsonData.questions;
                surveyData.user = req.user[0]._id;
                Survey.findByIdAndUpdate(surveyData._id, {$set: surveyData}, function(error, data) {
                        if(error) {
                                allErrors = getErrors(error, allErrors);
                                res.json({"success" : false, "errors" : allErrors});
                        } else {
                                res.json({"success" : true});
                        }
                });
        }
}

exports.delete = function(req, res) {
        var allErrors = new Array();;
        console.log(req.params);

        if(!(req.user && req.user[0])) {
                allErrors.push("You need to login first");
        }

        if(allErrors.length > 0) {
                res.json({"success" : false, "errors" : allErrors});
        } else {
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

exports.respond = function(req, res) {
        for (var key in req.body){
                var val = req.body[key];
                Survey.find({"questions.answers._id" : val}).exec(function(error, data) {
                        for(var i = 0 ; i < data.length ; i++) {
                                var survey = data[i];
                                var subdoc = survey.questions.id(key).answers.id(val);
                                subdoc.responses.push(Date.now());
                                survey.save();
                        }
                });
        }
        res.redirect('/allsurveys#/?msg=Successfully sent a response');
}

exports.mysurveys = function(req, res) {
        if(req.user && req.user[0]) {
                Survey.find({'user': req.user[0]._id}).populate('user', 'username').exec(function(err, data) {
                        res.json(data);
                });
        } else {
                res.redirect('/login');
        }
}

exports.surveysPage = function(req, res) {
        if(req.user) {
                res.redirect('/');
        } else {
                res.render('surveys');
        }
};
