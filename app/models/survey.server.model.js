/*
        Create the model for the user. Other Survey related database methods are also added in here.
*/
var mongoose = require('mongoose');

var AnswerSchema = new mongoose.Schema({
        text: {
                type: String,
                required: "Answer text is required"
        },
        _question: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Survey'
        },
        responses: [Date]
});

var QuestionSchema = new mongoose.Schema({
        text: {
                type: String,
                required: "Question text is required"
        },
        _answers: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Answer'
        }],
        _survey: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Survey'
        }
});

var SurveySchema = new mongoose.Schema({
        description: {
                type: String
        },
        activation: {
                type: Date,
                default: Date.now()
        },
        expiration: {
                type: Date,
                required: "You need to set an expiration date"
        },
        _owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
        },
        _questions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
        }]
});

mongoose.model('Survey', SurveySchema);
mongoose.model('Question', QuestionSchema);
mongoose.model('Answer', AnswerSchema);
