/* global module */
'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate;

module.exports = form(
  field('email'),
  field('password'),
  validate('email')
    .required("", "LOGIN_EMAIL_REQUIRED")
    .isEmail("LOGIN_INVALID_EMAIL"),
  validate('password')
    .required("", "LOGIN_PASSWORD_REQUIRED")
);

