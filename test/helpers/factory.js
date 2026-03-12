'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var Mongo = require('mongodb');
var bcrypt = require('bcrypt');
var db = require(__dirname + '/../../app/lib/db.js');
var Model;

module.exports = (model, fn)=>{
  var fixturePath = path.join(__dirname, '..', 'fixtures', model + '.json');
  var records = fs.readFileSync(fixturePath, 'utf8');
  records = JSON.parse(records);

  if (model === 'user') {
    return seedUsers(records, fn);
  }

  Model = require(__dirname + '/../../app/models/' + model + '.js');
  async.map(records, iterator, (e, objs)=>fn(objs));
};

function iterator(record, fn){
  Model.create(record, function(err, obj){
    fn(err, obj);
  });
}

function seedUsers(records, fn) {
  var users = records.map(function(record) {
    var user = {
      email: record.email,
      isValid: record.isValid !== false,
      joinedOn: record.joinedOn ? new Date(record.joinedOn) : new Date()
    };

    if (record._id) {
      user._id = new Mongo.ObjectId(record._id);
    } else {
      user._id = new Mongo.ObjectId();
    }

    // Allow plaintext in fixtures while storing secure hashes in DB.
    if (record.password && record.password.indexOf('$2') === 0) {
      user.password = record.password;
    } else {
      user.password = bcrypt.hashSync(record.password || 'password', 8);
    }

    return user;
  });

  db.getCollection('users').insertMany(users, function() {
    fn(users);
  });
}
