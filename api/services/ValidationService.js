/* global module, ErrorMessages */

'use strict';

var _ = require('lodash');

module.exports = {
  getValidationErrors: getValidationErrors,
  getFormFlashMessages: getFormFlashMessages
};

function getValidationErrors(errors) {
  var formattedErrors = {};
  // read the express form errors and get messages and error code for the error
  _.forEach(errors, function (fieldErrors, fieldName) {
    formattedErrors[fieldName] = [];
    // loop on each error and get the messages
    _.forEach(fieldErrors, function (error) {
      var errorBlock = {
        errorCode: error,
        message: ErrorMessages.mappings[error] ? ErrorMessages.mappings[error] : 'Error'
      };
      formattedErrors[fieldName].push(errorBlock);
    });
  });
  return formattedErrors;
}

function getFormFlashMessages(errors) {
  // push errors to messages array
  var messages = [];
  // get all the errors as array and return
  _.forEach(errors, function(fieldErrors) {
    _.forEach(fieldErrors, function(error) {
      var errorMessage = ErrorMessages.mappings[error] ? ErrorMessages.mappings[error] : 'Error';
      // push
      messages.push(errorMessage);
    });
  });

  return messages;
}
