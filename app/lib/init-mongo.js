'use strict';

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = `mongodb://localhost/${process.env.DBNAME}`;
var assert = require('assert');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(next);
  }else{
    next();
  }
};

function load(fn){
  MongoClient.connect(mongoUrl, (err, db)=>{
    if(err){throw err;}
    global.nss = {};
    global.nss.db = db;
    global.nss.db.ensureIndex('songs', {
      Artist: 'text',
    }, (err, indexname)=>{
      assert.equal(null, err);
      });
    console.log('Connected to MongoDB');
    fn();
  });
}
