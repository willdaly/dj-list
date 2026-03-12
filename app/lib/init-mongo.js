'use strict';

var MongoClient = require('mongodb').MongoClient;
var dbState = require(__dirname + '/db.js');
var initialized = false;
var initPromise;

module.exports = (req, res, next)=>{
  if(initialized){
    next();
    return;
  }
  if (!initPromise) {
    initPromise = load();
  }
  initPromise.then(function() {
    initialized = true;
    next();
  }).catch(function(err) {
    next(err);
  });
};

async function load(){
  var dbname = process.env.DBNAME || 'default-db';
  var mongoUrl = `mongodb://localhost/${dbname}`;
  var client = new MongoClient(mongoUrl);
  await client.connect();
  var db = client.db(dbname);
  dbState.setDb(db);
  await db.collection('songs').createIndex({Artist: 'text'});
  console.log('Connected to MongoDB');
}
