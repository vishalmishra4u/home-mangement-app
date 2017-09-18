module.exports.routes = {
  'POST /api/v1/homeEvent/createEvent' : {
    controller : 'EventController',
    action : 'createEvent'
  },
  'PUT /api/v1/homeEvent/updateEvent' : {
    controller : 'EventController',
    action : 'updateEvent'
  },
  'GET /api/v1/homeEvent/getHomeEvent' : {
    controller : 'EventController',
    action : 'getHomeEvent'
  }
};
