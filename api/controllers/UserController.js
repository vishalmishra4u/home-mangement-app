/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	registerUser : registerUserAction
};

function registerUserAction(req, res){
  if(!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }
  // create or find user in database and authenticate user
  User
    .registerUser(req.form)
    .then(function (userAndProfile){
      var user = userAndProfile.user;

      // User.sendActivationMail(user);
      return res.success(user);
    })
    .catch(function (err) {
      sails.log.error('UserController#registerAction :: Error registering user :: ', err);
      // check for the error code and accordingly send the response
      return res.handleError(err);
    });
}
