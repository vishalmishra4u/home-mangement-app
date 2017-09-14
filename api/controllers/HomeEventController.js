/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	createEvent : createEventAction,
	updateEvent : updateEventAction
};

function createEventAction(req, res){
	if(!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

	var user = req.user;
	HomeEvent
		.createHomeEvent(req.form, user)
		.then(function(event){

			return res.succes(event);
		})
		.catch(function(error){
			sails.log.error('HomeController#createHomeAction :: Error :: ', error);
      return res.handleError(error);
		});
}

function updateEventAction(req, res){
	if(!req.form.isValid) {
		var validationErrors = ValidationService
			.getValidationErrors(req.form.getErrors());
		return res.failed(validationErrors);
	}

	HomeEvent
		.updateHomeEvent(req.form)
		.then(function(event){

			return res.succes(event);
		})
		.catch(function(error){
			sails.log.error('HomeController#createHomeAction :: Error :: ', error);
			return res.handleError(error);
		});
}
