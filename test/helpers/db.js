'use strict';

var db = require('../../app/lib/db.js');
var connectMongo = require('../../app/lib/connect-mongo.js');
var dbname = process.env.DBNAME || 'dj-list';
var initPromise;

module.exports = function(fn){
  if (db.hasDb()) {
    if (fn) {
      fn();
      return;
    }
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = connectMongo(dbname).then(function(result) {
      db.setDb(result.db);
    });
  }

  if (fn) {
    initPromise.then(function() {
      fn();
    }).catch(function(err) {
      fn(err);
    });
    return;
  }

  return initPromise;
};
