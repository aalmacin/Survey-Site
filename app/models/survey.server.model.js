/*
        Create the model for the user. Other Survey related database methods are also added in here.
*/
var mongoose = require('mongoose');

/*
        Answer Schema and Question Schema are used to separate the nesting of questions and answers. This provides more organization of code
*/
var AnswerSchema = new mongoose.Schema({
        text: {
                type: String,
                trim: true,
                required: "Answer text is required"
        },
        responses: [Date]
});

var QuestionSchema = new mongoose.Schema({
        text: {
                type: String,
                trim: true,
                required: "Question text is required"
        },
        answers: [AnswerSchema]
});

/*
        The survey schema is the main Survey model that is used to store survey data
*/
var SurveySchema = new mongoose.Schema({
        description: {
                required: "A survey description must be added",
                trim: true,
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
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
        },
        questions: [QuestionSchema]
});


/*
        A virtual field (not saved in the db) is created (expirationDate). This is used to show a nicer date format.
*/
SurveySchema.virtual('expirationDate').get(function() {
        return this.expiration.toLocaleString();
});

SurveySchema.set('toJSON', {getters:true, virtuals:true});

mongoose.model('Survey', SurveySchema);
