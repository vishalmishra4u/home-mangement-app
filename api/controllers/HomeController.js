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
  Home
    .createHome(req.form)
    .then(function (home){
      var home = home.user;

      // User.sendActivationMail(user);
      return res.success(user);
    })
    .catch(function (err) {
      sails.log.error('HomeController#createHomeAction :: Error :: ', err);
      // check for the error code and accordingly send the response
      return res.handleError(err);
    });
}
