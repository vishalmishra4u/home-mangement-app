/**
 * Created by raviteja on 13/05/16.
 */
/**
 * Created by raviteja on 04/11/15.
 */
'use strict';

var _ = require('lodash'),
  shortid = require('shortid'),
  DATA_URL_REGEX = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i,
  VALID_URL_REGEX = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i,
  HTTP = require('http'),
  URL = require('url'),
  fs = require('fs'),
  mime = require('mime'),
  Q = require('q'),
  deeplinkConfig = sails.config.deeplinkConfig,
  moment = require('moment');

module.exports = {
  getDefaultValue: getDefaultValue,
  getExtensionFromUrl: getExtensionFromUrl,
  getOriginalNameFromUrl: getOriginalNameFromUrl,
  isDataUrl: isDataUrl,
  isEmptyString: isEmptyString,
  parseJSON: parseJSON,
  toJson: toJson,
  modelClone: modelClone,
  checkUrlExists: checkUrlExists,
  isUrl: isUrl,
  getS3Url: getS3Url,
  getLocalUrl: getLocalUrl,
  generateReferenceId: generateReferenceId,
  verifyReferenceId: verifyReferenceId,
  getCaseInsensitiveRegex: getCaseInsensitiveRegex,
  getFileSizeInBytes: getFileSizeInBytes,
  getFileMimeType: getFileMimeType,
  removeFilePath: removeFilePath,
  getExpirationTime: getExpirationTime,
  isTimeExpired: isTimeExpired,
  getDateRange : getDateRange
};

/**
 * Get default values
 *
 * @param val
 * @returns {*}
 */
function getDefaultValue(val) {

  if (_.isUndefined(val)) {
    return "";
  }

  return val;
}

/**
 * getExtensionFromUrl
 *
 * Returns file extension from the url
 *
 * @param url
 * @returns {string}
 *
 * Example:
 * url = 'http://google.com/doodle.png'
 * getExtensionFromUrl(url)
 * >> .png
 */
function getExtensionFromUrl(url) {
  var extension;
  url = url.substr(1 + url.lastIndexOf("/")).split('?')[0];
  extension = url.substr(url.lastIndexOf("."));

  return extension;
}

/**
 * getOriginalNameFromUrl
 *
 * Returns original file name for the given url
 *
 * @param url
 * @returns {*}
 *
 * Example:
 * url = 'http://google.com/doodle.png'
 * getOriginalNameFromUrl(url)
 * >> doodle.png
 */
function getOriginalNameFromUrl(url) {
  if (!url) {
    return "";
  }

  var urlArray = url.split('/');

  return urlArray[urlArray.length - 1];
}

/**
 * isDataUrl
 *
 * Returns boolean, checks whether the given url is boolean or not.
 *
 * @param url
 * @returns {boolean}
 */
function isDataUrl(url) {
  return url.substr(0, 5) === "data:";
}

/**
 * isEmptyString
 *
 * Checks whether given string is empty or not
 *
 * @param str
 * @returns {boolean}
 */
function isEmptyString(str) {
  return str !== "";
}


/**
 * parseJSON
 *
 * Converts the json to object; if not a string and given parameter is a object,
 * stringify's the object and then converts the string to object.
 *
 * if error in parsing; returns false.
 *
 * @param jsonString
 * @returns mixed
 */
function parseJSON(jsonString) {
  // check if jsonString is a object
  if (jsonString !== null && typeof jsonString === 'object') {
    // change it to json string
    jsonString = toJson(jsonString);
  }

  try {
    var obj = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns 'null', and typeof null === "object",
    // so we must check for that, too.
    if (obj && typeof obj === "object" && obj !== null) {
      return obj;
    }
  }
  catch (err) {
    sails.log.error('Utils#parseJSON :: Error parsing Json :: ', err);
    sails.log.error('Utils#parseJSON :: Parsed String :: ', jsonString);
  }

  return false;
}

/**
 * toJson
 *
 * Converts the Object to string;
 *
 * If error; returns false;
 *
 * @param obj
 * @returns {*}
 */
function toJson(obj) {
  try {
    var jsonString = JSON.stringify(obj);

    if (jsonString && typeof jsonString === "string" && jsonString !== null) {
      return jsonString;
    }
  } catch (err) {
    sails.log.error('Utils#toJSON :: Error converting to string :: ', err);
    sails.log.error('Utils#toJSON :: given Object :: ', obj);
  }

  return false;
}

/**
 * modelClone
 *
 * copy the values to destination from the source and omits extra properties
 *
 * @param destination
 * @param source
 */
function modelClone(destination, source) {
  // check if destination is array
  if (_.isArray(destination)) {
    // then just push source into array
    _.forEach(source, function (value, key) {
      // check if key is present in the structure
      destination[key] = source[key];
    });
  } else {
    _.forEach(destination, function (value, key) {
      if (source.hasOwnProperty(key)) {
        if (typeof destination[key] === "object" && destination[key] !== null && source[key]) {
          Utils.modelClone(destination[key], source[key]);
        } else {
          destination[key] = source[key];
        }
      }
    });
  }
}

/**
 * checkUrlExists
 *
 * Performs a simple HEAD request for the given url and checks for 200 status code
 *
 * @param url
 * @returns Promise
 */
function checkUrlExists(url) {
  return Q.promise(function (resolve, reject) {
    var options = {
      method: 'HEAD',
      host: URL.parse(url).host,
      port: 80,
      path: URL.parse(url).pathname
    };
    var req = HTTP.request(options, function (response) {

      if (response.statusCode === 200) {
        return resolve(url);
      } else {
        return reject();
      }
    });
    req.end();
  });

}

function isUrl(str) {
  return str.length < 2083 && VALID_URL_REGEX.test(str);
};

/**
 * Get S3 Url for the path's
 *
 * @param path
 * @returns {*}
 */
function getS3Url(path) {
  if (!path) {
    return "";
  }
  return 'https://s3.amazonaws.com/everytasc-staging-processed/' + path;
}

/**
 *
 * @returns {String} - Reference ID
 */
function generateReferenceId() {
  return shortid.generate();
}

/**
 * Verified whether the short id is valid
 *
 * @param id
 * @returns {Boolean}
 */
function verifyReferenceId(id) {
  return shortid.isValid(id);
}

function getCaseInsensitiveRegex(str) {
  return new RegExp(["^", str, "$"].join(""), "i");
}

function getFileSizeInBytes(filePath) {
  var stats = fs.statSync(filePath);

  return stats["size"];
}

function getFileMimeType(filePath) {
  return mime.lookup(filePath);
}

function removeFilePath(filePath) {
  return fs.unlink(filePath);
}

function getExpirationTime() {
  // calculate the duration
  var duration = moment.duration({
    'hour': 2
  });

  return moment().add(duration).format();
}

function isTimeExpired(dateString) {
  var emailTokenExpiresOn = moment(dateString);

  if (!emailTokenExpiresOn) {
    return true;
  }
  // get the current time
  var currentTime = moment();

  return emailTokenExpiresOn.diff(currentTime) <= 0;
}

function getLocalUrl(path) {
  // development
  if (process.env.NODE_ENV === 'development') {
    return "http://localhost:1337/" + path;
  } else if (process.env.NODE_ENV === 'staging') {
    return "http://46.137.213.164:8081/" + path;
  } else if (process.env.NODE_ENV === 'production') {
    return "http://46.137.213.164:8081/" + path;
  } else if (process.env.NODE_ENV === 'uat') {
    return "https://api-stg.toolrent.com" + path;
  }
  else {
    return "http://localhost:1337/" + path;
  }
}

function getDateRange(startDate, endDate){
  var dateStart = moment(startDate);
  var dateEnd = moment(endDate);
  var dateValues = [];

  while (dateEnd >= dateStart) {
    dateValues.push(dateStart.format('YYYY-MM-DD'));
    dateStart.add(1,'d');
  }

  return dateValues;
}
