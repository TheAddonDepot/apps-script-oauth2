// Copyright 2014 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @file Contains utility methods used by the library.
 */

/* exported buildUrl_ */
/**
 * Builds a complete URL from a base URL and a map of URL parameters.
 * @param {string} url The base URL.
 * @param {Object.<string, string>} params The URL parameters and values.
 * @return {string} The complete URL.
 * @private
 */
function buildUrl_(url, params) {
  var paramString = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}

/* exported validate_ */
/**
 * Validates that all of the values in the object are non-empty. If an empty
 * value is found, and error is thrown using the key as the name.
 * @param {Object.<string, string>} params The values to validate.
 * @private
 */
function validate_(params) {
  Object.keys(params).forEach(function(name) {
    var value = params[name];
    if (!value) {
      throw new Error(name + ' is required.');
    }
  });
}

/* exported getTimeInSeconds_ */
/**
 * Gets the time in seconds, rounded down to the nearest second.
 * @param {Date} date The Date object to convert.
 * @return {number} The number of seconds since the epoch.
 * @private
 */
function getTimeInSeconds_(date) {
  return Math.floor(date.getTime() / 1000);
}

/* exported extend_ */
/**
 * Copy all of the properties in the source objects over to the
 * destination object, and return the destination object.
 * @param {Object} destination The combined object.
 * @param {Object} source The object who's properties are copied to the
 *     destination.
 * @return {Object} A combined object with the desination and source
 *     properties.
 * @see http://underscorejs.org/#extend
 */
function extend_(destination, source) {
  var keys = Object.keys(source);
  for (var i = 0; i < keys.length; ++i) {
    destination[keys[i]] = source[keys[i]];
  }
  return destination;
}

/* exported toLowerCaseKeys_ */
/**
 * Gets a copy of an object with all the keys converted to lower-case strings.
 *
 * @param {Object} obj The object to copy.
 * @return {Object} A shallow copy of the object with all lower-case keys.
 */
function toLowerCaseKeys_(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  // For each key in the source object, add a lower-case version to a new
  // object, and return it.
  return Object.keys(obj).reduce(function(result, k) {
    result[k.toLowerCase()] = obj[k];
    return result;
  }, {});
}

/**
 * Default method to compute JWT signature.
 * 
 * @param {string} toSign String to Sign
 * @param {string} key Key used to sign string
 * @return {string} JWT Signature
 */
function computeJWTSignatureDefault_(toSign, key) {
  var signatureBytes =
      Utilities.computeRsaSha256Signature(toSign, key);
  return Utilities.base64EncodeWebSafe(signatureBytes);
}

/* exported encodeJwt_ */
/**
 * Encodes and signs a JWT.
 *
 * @param {Object} payload The JWT payload.
 * @param {string} key The key to use when generating the signature.
 * @param {Object} [customOptions] Options to customize JWT encoding
 * @param {Object} [customOptions.header] Supply custom header properties
 * @param {Function} [customOptions.computeJWTSignature] Custom function 
 *    to compute JWT signature.
 * @return {string} The encoded and signed JWT.
 */
function encodeJwt_(payload, key, customOptions) {
  var customOptions = customOptions || {};
  
  var header = Object.assign({
    alg: 'RS256',
    typ: 'JWT'
  }, customOptions.header || {});

  var computeJWTSignature = typeof customOptions.computeJWTSignature === 'function' ?
      customOptions.computeJWTSignature : computeJWTSignatureDefault_;

  var toSign = Utilities.base64EncodeWebSafe(JSON.stringify(header)) + '.' +
      Utilities.base64EncodeWebSafe(JSON.stringify(payload));

  var signature = computeJWTSignature(toSign, key);
  return toSign + '.' + signature;
}

/* exported decodeJwt_ */
/**
 * Decodes and returns the parts of the JWT. The signature is not verified.
 *
 * @param {string} jwt The JWT to decode.
 * @return {Object} The decoded payload.
 */
function decodeJwt_(jwt) {
  var payload = jwt.split('.')[1];
  var blob = Utilities.newBlob(Utilities.base64DecodeWebSafe(payload));
  return JSON.parse(blob.getDataAsString());
}
