/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	createHome : createHomeAction
};

function createHomeAction(req, res){
	if(!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }
  // create or find user in database and authenticate user
	var user = req.user;
	Home
    .createHome(req.form, user)
    .then(function (home){

      return res.success(home);
    })
    .catch(function (err) {
      sails.log.error('HomeController#createHomeAction :: Error :: ', err);
      // check for the error code and accordingly send the response
      return res.handleError(err);
    });
}
