
module.exports = {
	registerUser : registerUserAction,
	login : loginAction,
	updateUserProfile : updateUserProfileAction
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

function loginAction(req, res) {
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  User
    .getForEmailPassword(req.form)
    .then(function (user) {
      var data = user.toApi();

      var response = AuthenticationService.getAuthenticatedResponse({
        user: data
      });

      return res.success(response);
    })
    .catch(function (err) {
      sails.log.error('UserController#loginAction :: Login error :: ', err);
      return res.handleError(err);
    });
}

function updateUserProfileAction(req, res){
	if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }
  var data = req.form;
  data.user = req.user.id;

  User
    .updateData(data)
    .then(function(user){
      var data = user.toApi();

      return res.success(data);
    })
    .catch(function(err){
      sails.log.error('UserController#updateAction :: err : ', err);
      return res.handleError(err);
    });
}
