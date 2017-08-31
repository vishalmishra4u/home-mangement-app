/**
 * Home.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name : {
      type : 'String'
    },
    referenceId : {
      type : 'String'
    },
    city : {
      type : 'String'
    },
    state : {
      type : 'String'
    },
    user : {
      collection : 'User',
      via : 'home'
    }
  },
  createHome : createHome
};

function createHome(homeData){
  return Q.promise(function(resolve, reject){
    Home
      .create(homeData)
      .then(function(){

        return resolve(home.toApi());
      })
      .catch(function(error){
        sails.log.error('Home#createHome : error : ', error);
        return reject(error);
      });
  });
}
