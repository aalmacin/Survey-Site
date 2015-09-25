/*
        Create the model for the user. Other Survey related database methods are also added in here.
*/
var mongoose = require('mongoose');

var AnswerSchema = new mongoose.Schema({
        text: {
                type: String,
                required: "Answer text is required"
        },
        responses: [Date]
});

var QuestionSchema = new mongoose.Schema({
        text: {
                type: String,
                required: "Question text is required"
        },
        answers: [AnswerSchema]
});

var SurveySchema = new mongoose.Schema({
        description: {
                type: String
        },
        owner: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
        },
        activation: {
                type: Date,
                default: Date.now()
        },
        expiration: {
                type: Date,
                required: "You need to set an expiration date"
        },
        questions: [QuestionSchema]
});

mongoose.model('Survey', SurveySchema);
mongoose.model('Question', QuestionSchema);
mongoose.model('Answer', AnswerSchema);
