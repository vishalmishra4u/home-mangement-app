
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
    about: {
      type: 'string',
      columnName: 'about'
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
    }
  }

  registerUser: registerUser
};

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
