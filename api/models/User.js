
var Q = require('q'),
   _ = require('lodash'),
   uuid = require('node-uuid'),
   md5 = require('md5'),
   crypto = require('crypto');

module.exports = {

  attributes: {
    firstName: {
      type: 'string',
      columnName: 'firstName'
    },
    lastName: {
      type: 'string',
      columnName: 'lastName'
    },
    referenceId: {
      type: 'string',
      required: true
    },
    city: {
      type: 'string',
      columnName: 'city'
    },
    state: {
      type: 'string',
      columnName: 'state'
    },
    email: {
      type: 'string',
      columnName: 'email',
      unique: true
    },
    salt: {
      type: 'text',
      columnName: 'salt'
    },
    password: {
      type: 'text',
      columnName: 'password'
    },
    isActive: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true
    },
    isDeleted: {
      type: 'boolean',
      columnName: 'is_deleted',
      defaultsTo: false
    },
    systemUniqueKey: {
      type: 'string',
      columnName: 'system_unique_key'
    },
    home : {
      model : 'home'
    },
    homeEvent : {
      model : 'Event'
    },
    toApi : toApi
  },

  registerUser: registerUser,
  loadUserByEmail : loadUserByEmail,
  createNewUser : createNewUser,
  generateSalt : generateSalt,
  generateUuid : generateUuid,
  generateEncryptedPassword : generateEncryptedPassword,
  getForEmailPassword : getForEmailPassword,
  updateData : updateData,
  getUserForId : getUserForId
};

function toApi() {
  var user = this.toObject();
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email ? user.email : "",
    isActive: user.isActive,
    isDeleted: user.isDeleted,
    isUpdatedProfile: user.isUpdatedProfile,
    city: user.city,
    state: user.state,
    referenceId: user.referenceId,
    systemUniqueKey: user.systemUniqueKey
  };
}


function registerUser(userData) {
  return Q.promise(function (resolve, reject) {
    User
      .loadUserByEmail(userData.email)
      .then(function (user) {
        if (user) {
          return reject({
            code: 400,
            message: "REGISTRATION_USER_ALREADY_EXISTS"
          });
        }
        User
          .createNewUser(userData)
          .then(resolve)
          .catch(function (err) {
            sails.log.error('User#registerUser :: Error while registering user :: ', err);

            return reject({code: 500, message: 'INTERNAL_SERVER_ERROR'});
          });
      })
      .catch(function (err) {
        sails.log.error('User#registerUser :: Error while registering user :: ', err);
        return reject({code: 500, message: 'INTERNAL_SERVER_ERROR'});
      });
  });
}

function createNewUser(userData) {
  return Q.promise(function (resolve, reject) {
    var newUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        city: userData.city,
        state: userData.state,
        referenceId: Utils.generateReferenceId(),
        password: null,
        salt: null,
        systemUniqueKey: generateUuid()
      },
      salt = generateSalt();

    generateEncryptedPassword(userData.password, salt)
      .then(function (encryptedPassword) {
        newUser.password = encryptedPassword;
        newUser.salt = salt;
        return User.create(newUser);
      })
      .then(function (user) {

        return resolve({
          user: user.toApi()
        });
      })
      .catch(function (err) {
        sails.log.error('User#createNewUser :: Error while creating a new user :: ', err);
        return reject(err);
      });
  });
}

function generateSalt() {
  return md5(uuid.v1());
}

function generateUuid() {
  return generateSalt();
}

function generateEncryptedPassword(password, salt) {
  return Q.promise(function (resolve, reject) {

    crypto.pbkdf2(password, salt, 10, 512, 'sha512', function (err, encrypted) {
      if (err) {
        sails.log.error('User#generateEncryptedPassword :: ', err);
        return reject(err);
      }
      return resolve(encrypted.toString('hex'));
    });
  });
}

function loadUserByEmail(email) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      email: email
    };
    User
      .findOne(criteria)
      .then(function (user) {
        if (!user) {
          sails.log.silly('User#loadUserByEmail :: No user available for the given email :: ', email);
          return resolve(null);
        }
        return resolve(user);
      })
      .catch(function (err) {
        sails.log.error('User#loadUserByEmail :: Error querying DB :: ', err);
        return reject(err);
      });
  });
}

function getForEmailPassword(data) {
  return Q.promise(function (resolve, reject) {
    if (!data) {
      sails.log.verbose('User#getForEmailPassword :: data null');
      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    User
      .loadUserByEmail(data.email)
      .then(function (user) {
        if (!user) {
          sails.log.info('User#getForEmailPassword :: No user available for the given email :: ', data.email);
          return reject({
            code: 404,
            message: 'LOGIN_USER_NOT_FOUND'
          });
        }
        var salt = user.salt;
        generateEncryptedPassword(data.password, salt)
          .then(function (hashedPassword) {
            if (hashedPassword !== user.password) {
              return reject({code: 401, message: 'LOGIN_USER_INVALID_CREDENTIALS'});
            }
            user.save(function () {});

            return resolve(user);
          });
      })
      .catch(function (err) {
        sails.log.error('User#getForEmailPassword :: Error :: ', err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function updateData(userData) {
  return Q.promise(function (resolve, reject) {
    var email = userData.email;

    User
      .loadUserByEmail(email)
      .then(function (user) {

        if (!user) {
          return reject({
            code: 404,
            message: "LOGIN_USER_NOT_FOUND"
          });
        }
        user.firstName = userData.firstName || user.firstName;
        user.lastName = userData.lastName || user.lastName;
        user.city = userData.city || user.city;
        user.state = userData.state || user.state;

        var newUser = _.clone(user);

        user.save(function (err) {
          if (err) {
            sails.log.error('User#updateData :: Error in saving to database ::', err);
            return reject(err);
          }
          else {
            return resolve(newUser);
          }
        });
      })
      .catch(function(err){
        sails.log.error('User#updateData :: err :',err);
        return reject(err);
      });
  });
}

function getUserForId(user) {
  return Q.promise(function (resolve, reject) {
    if (!user) {
      sails.log.error('User#getUserForId :: User id is null ');
      return reject({code: 400, message: 'USER_INVALID_REQUEST'});
    }

    var criteria = {
      id: user,
      isActive: true,
      isDeleted: false
    };
    User
      .findOne(criteria)
      .then(function (user) {
        if (!user) {
          return reject({code: 404, message: 'USER_NOT_FOUND'});
        } else {
          return resolve(user);
        }
      })
      .catch(function (err) {
        sails.log.error('User#getUserForId :: Error in query :: ', err);

        return reject({code: 500, message: 'INTERNAL_SERVER_ERROR'});
      });
  });
}
