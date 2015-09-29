/*
        The Route file for surveys. This is where the RESTful api for the survey will be set along with other survey related pages.
*/
var surveys = require('../controllers/surveys.server.controller');

module.exports = function(app) {
        app.route('/allsurveys')
                .get(surveys.surveysPage);
        app.route('/surveys')
                .get(surveys.all)
                .post(surveys.create);
        app.route('/surveys/:id')
                .put(surveys.update)
                .delete(surveys.delete);
        app.route('/mysurveys')
                .get(surveys.mysurveys);
        app.route('/surveys/:id/response')
                .get(surveys.response);
        app.route('/surveys/respond')
                .post(surveys.respond);
}
