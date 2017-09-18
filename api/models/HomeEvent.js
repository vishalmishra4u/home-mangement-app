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
    },
    isActive : {
      type : 'boolean',
      defaultsTo : true
    }
  },
  createHomeEvent : createHomeEvent,
  updateHomeEvent : updateHomeEvent,
  getHomeEvent : getHomeEvent
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

function updateHomeEvent(eventData){
  return Q.promise(function(resolve, reject) {
    HomeEvent
      .find(eventData.id)
      .then(function(homeEvent){

        homeEvent.name = eventData.name || homeEvent.name;
        homeEvent.startDate = eventData.startDate || homeEvent.startDate;
        homeEvent.endDate = eventData.endDate || homeEvent.endDate;
        homeEvent.repeating = eventData.repeating || homeEvent.repeating;
        homeEvent.frequencyRepeating = eventData.frequencyRepeating || homeEvent.frequencyRepeating;

        return resolve(homeEvent);
      })
      .catch(function(error){
        sails.log.error('HomeEvent#createHomeEvent :: error :', error);
        return reject(error);
      });
  });
}

function getHomeEvent(homeEventId){
  return Q.promise(function(resolve, reject) {
    HomeEvent
      .findOne({
        id : homeEventId,
        isActive : true
      })
      .then(function(homeEvent){

        if(!homeEvent){
          return reject({
            code: 404,
            message : 'EVENT_NOT_FOUND'
          });
        }
        return resolve(homeEvent);
      })
      .catch(function(error){
        sails.log.error('HomeEvent#getHomeEvent :: error :', error);
        return reject(error);
      });
  });
}
