/* global module, sails, AuthenticationService, User */

'use strict';

var _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  conf = sails.config,
  secret = conf.session.secret,
  Q = require('q');

module.exports = {
  authenticate: authenticate,
  getAuthenticatedResponse: getAuthenticatedResponse,
  validateToken: validateToken,
  getAuthenticatedResponseV2: getAuthenticatedResponseV2
};

function authenticate(user) {
  // check user and return
  if (!user) {
    return null;
  }
  // generate a user id and authenticate
  var payload = {
    userInfo: user.id
  };
  // return token and user information with a refresh token
  var options = {};

  return jwt.sign(payload, secret, options);
}

function getAuthenticatedResponse(userAndProfile) {
  if (!userAndProfile) {
    return null;
  }
  var user = userAndProfile.user;

  // remove the system unique key
  if(_.has(user, "systemUniqueKey")) {
    delete user.systemUniqueKey;
  }

  return {
    user: user,
    token: AuthenticationService.authenticate(userAndProfile.user),
    profile: userAndProfile.profile
  };
}

function getAuthenticatedResponseV2(user) {
  if (!user) {
    return null;
  }
  // remove the system unique key
  if(_.has(user, "systemUniqueKey")) {
    delete user["systemUniqueKey"];
  }

  return {
    user: user,
    token: AuthenticationService.authenticate(user)
  };
}

/**
 * Validates the authentication token and fetches the user from db
 *
 * @param authToken
 */
function validateToken(authToken) {
  var authPayload;
  return Q.promise(function (resolve, reject) {
    // validate the token
    try {
      authPayload = jwt.verify(authToken, secret);
    } catch (err) {
      sails.log.error('AuthenticationService#validateToken :: Error while ' +
        'verifying the token :: ', err);

      return reject({
        code: 401,
        message: 'USER_INVALID_AUTH'
      });
    }

    // check if payload is an object
    if (_.isUndefined(authPayload) || !authPayload) {
      sails.log.error('AuthenticationService#validateToke :: Unidentified ' +
        'payload :: ', authPayload);

      return reject({
        code: 401,
        message: 'USER_INVALID_AUTH'
      });
    }
    var userId = authPayload.userInfo;
    // get user for id
    User
      .getUserForId(userId)
      .then(resolve)
      .catch(function (err) {
        sails.log.error('AuthenticationService#validateToken :: Error :: ', err);
        // throw a 401 error
        return reject({
          code: 401,
          message: 'USER_INVALID_AUTH'
        });
      });
  });
}
