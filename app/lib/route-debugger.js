'use strict';

var util = require('util');
var SENSITIVE_KEY_REGEX = /(pass(word)?|email|token|secret|auth|cookie|session|key)/i;

function redactValue(value) {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === 'object') {
    var output = {};
    Object.keys(value).forEach(function(key) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        output[key] = '[REDACTED]';
        return;
      }

      output[key] = redactValue(value[key]);
    });
    return output;
  }

  return value;
}

module.exports = (req, res, next)=>{
  console.log('---NEW REQUEST FROM BROWSER---');
  console.log(util.format('%s: %s', 'URL    ', req.url));
  console.log(util.format('%s: %s', 'VERB   ', req.method));
  console.log(util.format('%s: %s', 'PATH   ', req.path));
  console.log(util.format('%s: %s', 'PARAMS ', util.inspect(redactValue(req.params))));
  console.log(util.format('%s: %s', 'QUERY  ', util.inspect(redactValue(req.query))));
  console.log(util.format('%s: %s', 'BODY   ', util.inspect(redactValue(req.body))));
  next();
};