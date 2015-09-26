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
                .deepPopulate('answers')
                .exec(function(error, data) {
                // Show a json page with the error message as the argument if an error is present. Otherwise, display the data.
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
        var survey = createSurvey(req.body.survey);
        var errorMessages = new Array();
        if (survey._id) {
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
                                question.save(function(err) { console.log(err);});
                                survey._questions.push(question);
                        } else {
                                errorMessages.push(question);
                        }
                }
                survey.save(function(err) { console.log(err);});
        } else {
                errorMessages.push(survey);
        }

        if (errorMessages.length > 0) {
                res.json(errorMessages);
        } else {
                res.json(req.body);
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
