'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('id'),
  field('address'),
  field('landmark'),
  field('city'),
  field('state'),
  field('pincode')
);
