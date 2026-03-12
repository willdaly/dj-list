'use strict';

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = `mongodb://localhost/${process.env.DBNAME}`;
var dbState = require(__dirname + '/db.js');
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
  MongoClient.connect(mongoUrl, {useUnifiedTopology: true}, (err, db)=>{
    if(err){throw err;}
    dbState.setDb(db);
    db.collection('songs').createIndex({Artist: 'text'}, function(indexErr){
      if(indexErr){throw indexErr;}
      console.log('Connected to MongoDB');
      fn();
    });
  });
}
