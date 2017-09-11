'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('name'),
  field('assignedTo'),
  field('startDate'),
  field('endDate'),
  validate('name')
    .required("", "EVENT_NAME_REQUIRED"),
  validate('assignedTo')
    .required("", "EVENT_ASSIGNED_TO_USER_REQUIRED"),
  validate('startDate')
    .required("","EVENT_START_DATE_REQUIRED"),
  validate('startDate')
    .required("","EVENT_END_DATE_REQUIRED")
);
