'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('name'),
  field('address'),
  field('landmark'),
  field('city'),
  field('state'),
  field('pincode'),
  validate('name')
    .required("", "HOME_NAME_REQUIRED"),
  validate('city')
    .required("", "HOME_CITY_REQUIRED"),
  validate('pincode')
    .required("","HOME_PINCODE_REQUIRED")
);
