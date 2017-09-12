var Q = require('q');

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
    },
    repeating : {
      type : 'boolean'
    },
    frequencyRepeating : {
      type : 'integer'
    }
  },
  createHomeEvent : createHomeEvent
};

function createHomeEvent(eventData, user){
  return Q.promise(function(resolve, reject) {
    eventData.createdBy = user.id;
    HomeEvent
      .create(eventData)
      .then(function(homeEvent){

        return resolve(homeEvent);
      })
      .catch(function(error){
        sails.log.error('HomeEvent#createHomeEvent :: error :', error);
        return reject(error);
      });
  });
}
