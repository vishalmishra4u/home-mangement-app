'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('firstName'),
  field('lastName'),
  field('email'),
  field('about'),
  field('city'),
  field('state'),
  field('password'),
  validate('password')
    .required("", "REGISTRATION_PASSWORD_REQUIRED")
    .minLength(6, "REGISTRATION_PASSWORD_MIN_LENGTH"),
  validate('email')
    .required("", "REGISTRATION_EMAIL_REQUIRED")
    .isEmail("REGISTRATION_INVALID_EMAIL")
);
