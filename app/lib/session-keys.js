'use strict';

module.exports = function getSessionKeys() {
  var rawKeys = process.env.SESSION_KEYS;

  if (rawKeys) {
    var keys = rawKeys.split(',').map(function(key) {
      return key.trim();
    }).filter(function(key) {
      return key.length > 0;
    });

    if (keys.length >= 2) {
      return keys;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_KEYS must include at least two comma-separated values in production.');
  }

  return ['dev-insecure-session-key-1', 'dev-insecure-session-key-2'];
};
