/**
 * Created by vishal on 30/4/16.
 */
'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('firstName'),
  field('lastName'),
  field('city'),
  field('state'),
  field('email'),
  validate('email')
    .required("", "REGISTRATION_EMAIL_REQUIRED")
);
