/**
 * Home.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');

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
    },
    createdBy : {
      model : 'User'
    },
    isDeleted : {
      type : 'boolean',
      defaultsTo : false
    },
    toApi : toApi
  },
  createHome : createHome,
  updateHome : updateHome
};

function toApi(){
  var home = this.toObject();

  return {
    name : home.name,
    referenceId : home.referenceId,
    city : home.city,
    state : home.state
  };
}

function createHome(homeData, user){
  return Q.promise(function(resolve, reject){
    Home
      .findOne({
        name : homeData.name.toLowerCase()
      })
      .then(function(home){
        if(home){
          return reject({
            code : 400,
            message : 'HOME_EXISTS_BY_SAME_NAME'
          });
        }
        Home
          .create(homeData)
          .then(function(home){

            home.name = homeData.name.toLowerCase();
            home.createdBy = user.id;
            home.referenceId = Utils.generateReferenceId();
            home.save();

            return resolve(home.toApi());
          })
          .catch(function(error){
            sails.log.error('Home#createHome : error : ', error);
            return reject(error);
          });
      })
      .catch(function(error){
        sails.log.error('Home#createHome : error : ', error);
        return reject(error);
      });
  });
}

function updateHome(homeData){
  return Q.promise(function(resolve, reject){
    Home
      .findOne({
        id : homeData.id,
        isDeleted : false
      })
      .then(function(home){
        home.address = homeData.address || home.address;
        home.landmark = homeData.landmark || home.landmark;
        home.city = homeData.city || home.city;
        home.state = homeData.state || home.state;
        home.pincode = homeData.pincode || home.pincode;

        home.save();

        return resolve(home);
      })
      .catch(function(error){
        sails.log.error('Home#updateHome : error : ', error);
        return reject(error);
      });
  });
}
