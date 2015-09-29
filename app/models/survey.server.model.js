/*
        Create the model for the user. Other Survey related database methods are also added in here.
*/
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

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

SurveySchema.virtual('expirationDate').get(function() {
        return this.expiration.toLocaleString();
});

SurveySchema.plugin(deepPopulate, {
        rewrite: {
        }
});

SurveySchema.set('toJSON', {getters:true, virtuals:true});

mongoose.model('Survey', SurveySchema);
