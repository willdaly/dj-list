'use strict';

var activeDb = null;

exports.setDb = function(db) {
  activeDb = db;
};

exports.getDb = function() {
  if (!activeDb) {
    throw new Error('Database not initialized');
  }
  return activeDb;
};

exports.getCollection = function(name) {
  return exports.getDb().collection(name);
};

exports.hasDb = function() {
  return !!activeDb;
};
