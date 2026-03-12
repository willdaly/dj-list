'use strict';

let activeDb = null;

exports.setDb = (db) => {
  activeDb = db;
};

exports.getDb = () => {
  if (!activeDb) {
    throw new Error('Database not initialized');
  }
  return activeDb;
};

exports.getCollection = (name) => {
  return exports.getDb().collection(name);
};

exports.hasDb = () => {
  return !!activeDb;
};
