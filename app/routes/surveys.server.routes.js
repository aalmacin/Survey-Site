/*
        The Route file for surveys. This is where the RESTful api for the survey will be set along with other survey related pages.
*/
var surveys = require('../controllers/surveys.server.controller');

module.exports = function(app) {
        // All the application routes. All of these are accessible using the browser or CURL/WGET. Used by Angular to connect to our db.

        // Render the all surveys page for anonymous users
        app.route('/allsurveys')
                .get(surveys.surveysPage);
        // create a new survey or show all surveys
        app.route('/surveys')
                .get(surveys.all)
                .post(surveys.create);
        // Update or delete a survey
        app.route('/surveys/:id')
                .put(surveys.update)
                .delete(surveys.delete);
        // Show all logged in user's surveys
        app.route('/mysurveys')
                .get(surveys.mysurveys);
        // Show a report data from one survey
        app.route('/surveys/:id/response')
                .get(surveys.response);
        // Respond to a survey
        app.route('/surveys/respond')
                .post(surveys.respond);
}
