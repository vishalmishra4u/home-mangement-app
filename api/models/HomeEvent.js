/**
 * Event.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name : {
      type : 'String'
    },
    assignedTo : {
      collection : 'User',
      via : 'homeEvent'
    },
    createdBy : {
      model : 'User'
    },
    startDate : {
      type : 'Date'
    },
    endDate : {
      type : 'Date'
    }
  }
};
