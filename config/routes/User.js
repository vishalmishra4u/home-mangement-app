module.exports.routes = {
  'POST /api/v1/user/registerUser': {
    controller: 'UserController',
    action: 'registerUser'
  },
  'POST /api/v1/user/login': {
    controller: 'UserController',
    action: 'login'
  },
  'PUT /api/v1/user/updateProfile': {
    controller: 'UserController',
    action: 'updateUserProfile'
  }
};
