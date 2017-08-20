'use strict';

var ServiceHelper = require('./ServiceHelper');
var AppUtil = require('./AppUtil');
var ObjectHelper = require('./ObjectHelper');

/**
 * The Service Driver module
 * @param {Object} port - The optional service configurations that will be used to make the http call
 * @param {Object} host - The optional service configurations that will be used to make the http call
 * @param {Object} protocol - The optional service configurations that will be used to make the http call
 *
 * @author Hadi Shayesteh <hadishayesteh@gmail.com>
 * @since  23 February 2017
 *
 * @module ServiceDriver
 */
var ServiceDriver = function ServiceDriver(port, host, protocol) {

  var basicConfig = {};
  basicConfig.host = host;
  basicConfig.port = port;

  var additionalConfig = {};
  additionalConfig.http_protocol = protocol;

  this.config = basicConfig;
  this.additionalConfig = additionalConfig;
};

// Setter for timeout
ServiceDriver.prototype.setTimeOut = function (timeOut) {
  this.additionalConfig.request_timeout = timeOut;
};

// Setter for Header
ServiceDriver.prototype.setHeader = function (headers) {
  this.config.headers = headers;
};

// Setter for method
ServiceDriver.prototype.setMethod = function (method) {
  this.config.method = method;
};

//Setter for Path
ServiceDriver.prototype.setPath = function (path) {

  var urlPath = path;
  var message = null;
  if (AppUtil.isNullOrUndefined(urlPath)) {
    message = 'Required Path Not Set';
  }
  if (message != null) {
    var reqError = {
      message: message
    };
    return callback(reqError, null);
  }

  this.config.path = urlPath;
};

/**
 * Make a basic http(s) call to a given path
 *
 * @param {function} funcHandleResponse - The function responsible for handling the response
 * @param {function} callback - The callback that will handle the result of the service call
 *
 * @author Hadi Shayesteh <hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 */
ServiceDriver.prototype.makeBasicCall = function makeBasicCall(funcHandleResponse, callback) {
  var config = this.config;

  var http = require('http');
  var message = null;

  if (message != null) {
    var reqError = {
      message: message
    };
    return callback(reqError, null, null);
  }

  var didTimeout = false;

  var request = http.request(config, function httpRequestCallback(response) {
    var data = '';
    response.on('data', function responseOnDataCallback(chunk) {
      data += chunk;
    });

    response.on('end', function responseOnEndCallback() {
      var responseData = '';
      if (data != '') {
        try {
          responseData = JSON.parse(data);
        } catch (exception) {
          var hostname = (request && request._headers && request._headers.host) ? request._headers.host : 'not_found';
          var parseError = {
            message: 'An error occurred while parsing the response: ' + exception.message,
            statusCode: -1
          };
          return callback(parseError, null, null);
        }
      }
      return funcHandleResponse(response, responseData, callback);
    });
  });
  // request.setTimeout(config.request_timeout);
  request.on('timeout', function onTimeOut() {

    // Set the flag for when there is a timeout.
    didTimeout = true;
    var hostname = (request && request._headers && request._headers.host) ? request._headers.host : 'not_found';

    // Abort the request due to having reached the timeout limit.
    request.abort();
  });

  request.on('error', function requestOnErrorCallback(error) {

    var hostname = (request && request._headers && request._headers.host) ? request._headers.host : 'not_found';

    var message = 'RequestError';

    // Check if there was a timeout.
    if (didTimeout) {
      message = 'TimeoutError';
      // Reset the flag.
      didTimeout = false;
    } else {
      if (!AppUtil.isNullOrUndefined(error.message)) {
        message = error.message;
      }
    }
    var reqError = {
      message: message
    };
    return callback(reqError, null, null);
  });
  request.end();

};

/**
 * Performs an http post call to the path specified in the config
 *
 * @param {Object} payload - The payload that will be passed to the post request
 * @param {Object} funcHandleResponse - The function responsible for handling the post response
 * @param {function} callback - The callback that will handle the result of the service call
 *
 * @author Hadi Shayesteh <hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 */
ServiceDriver.prototype.post = function post(payload, funcHandleResponse, callback) {

  var config = this.config;

  var http = require('http');
  
  var didTimeout = false;
  var request = http.request(config, function httpRequestCallback(response) {
    var data = '';
    response.on('data', function responseOnDataCallback(chunk) {
      data += chunk;
    });
    response.on('end', function responseOnEndCallback() {
      var responseData = '';
      if (data != '') {
        try {
          responseData = JSON.parse(data);
        } catch (exception) {
          var hostname = (request && request._headers && request._headers.host) ? request._headers.host : 'not_found';
          var parseError = {
            message: 'An error occurred while parsing the response: ' + exception.message,
            statusCode: -1
          };
          return callback(parseError, null, null);
        }
      }
      return funcHandleResponse(response, responseData, callback);

    });
  });
  
  request.on('timeout', function onTimeOut() {
    // Set the flag for when there is a timeout.
    didTimeout = true;
    var hostname = (request && request._headers && request._headers.host) ? request._headers.host : 'not_found';

    // Abort the request due to having reached the timeout limit.
    request.abort();
  });

  request.on('error', function requestOnErrorCallback(error) {
    var hostname = (request && request._headers && request._headers.host) ? request._headers.host : 'not_found';

    var message = 'RequestError';

    // Check if there was a timeout.
    if (didTimeout) {
      message = 'TimeoutError';
      // Reset the flag.
      didTimeout = false;
    } else {
      if (!AppUtil.isNullOrUndefined(error.message)) {
        message = error.message;
      }
    }
    var reqError = {
      message: message
    };

    return callback(reqError, null);

  });

  // We need to ensure that the request body is string
  if (typeof payload != 'string') {
    payload = JSON.stringify(payload);
  }

  request.end(payload);
};

module.exports = ServiceDriver;