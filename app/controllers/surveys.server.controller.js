/*
        All the methods used to do crud operations are to be called from here. This is the middle object between the route and it's corresponding model.
*/
var Survey = require('mongoose').model('Survey'),
        Question = require('mongoose').model('Question'),
        Answer = require('mongoose').model('Answer');

var getErrors = function(error) {
        var messages = ["An error has occured"];
        console.log('Errors : ',error);
        return messages;
}

exports.all = function(req, res) {
        Survey.find({})
                .deepPopulate('answers')
                .exec(function(error, data) {
                if(error) {
                        res.json(error);
                } else {
                        res.json(data);
                }
        });
}

var createSurvey = function(data) {
        var survey = new Survey(data);
        survey.save(function(error) {
                if(error) return {"messages" : getErrors(error)};
        });
        return survey;
}

var createQuestions = function(id, data) {
        var question = new Question(data);
        question.save(function(error) {
                if(error) return {"messages" : getErrors(error)};
        });
        return question;
}

var createAnswers = function(id, data) {
        var answer = new Answer(data);
        answer.save(function(error) {
                if(error) return {"messages" : getErrors(error)};
        });
        return answer;
}

// Using the Survey model, create a new survey using the json data passed (using body-parser) from the form.
exports.create = function(req, res) {
        var errorMessages = new Array();
        if(req.body.questions.length === 0) {
                errorMessages.push("Need to add at least one question.");
        } else {
                for(var i = 0; i < req.body.questions.length; i++) {
                        var bodyQuestion = req.body.questions[i];
                        if(bodyQuestion.text.length === 0) {
                                errorMessages.push("Question text must be added");
                        } else if(bodyQuestion.answers.length < 2) {
                                errorMessages.push("Need to add at least two answers for: " + req.body.questions[i].text);
                        } else if(bodyQuestion.answers.length !== 0) {
                                for(var j = 0; j < bodyQuestion.answers.length; j++) {
                                        if(bodyQuestion.answers[j].text.length === 0) {
                                                errorMessages.push("Answer text must be added");
                                        }
                                }
                        }
                }
        }
        if(req.user && req.user[0]) {
                req.body.survey._owner = req.user[0]._id;
                var survey = createSurvey(req.body.survey);
                console.log(survey);
                if (survey._id && req.body.questions) {
                        for (var i=0; i < req.body.questions.length; i++) {
                                var questionJSON = req.body.questions[i];

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
                                                        errorMessages.push(answer);
                                                }
                                                question._answers.push(answer);
                                        }
                                        question.save(function(err) {
                                                errorMessages.push(getErrors(err));
                                        });
                                        survey._questions.push(question);
                                } else {
                                        errorMessages.push(question);
                                }
                        }
                        survey.save(function(err) {
                                errorMessages.push(getErrors(err));
                        });
                } else {
                        errorMessages.push(survey);
                }

                if (errorMessages.length === 0) {
                        res.json(req.body);
                }
        } else {
                errorMessages.push("Need to login first");
        }


        if (errorMessages.length > 0) {
                res.json({"error" : true, "errors" : errorMessages});
        }
}

exports.update = function(req, res) {
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
        Answer.findByIdAndUpdate(req.params.id, {$push: {"responses": Date.now()}}, function(error, data) {

                if(error)
                        res.json({"messages" : getErrors(error)});
                else
                        res.json(data);
        });
}
