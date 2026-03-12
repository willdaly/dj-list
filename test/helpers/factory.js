'use strict';

var fs = require('fs');
var path = require('path');
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var db = require(path.join(__dirname, '..', '..', 'app', 'lib', 'db.js'));
var Model;

module.exports = async (model, fn)=>{
  var fixturePath = path.join(__dirname, '..', 'fixtures', model + '.json');
  var records = fs.readFileSync(fixturePath, 'utf8');
  records = JSON.parse(records);

  if (model === 'user') {
    return seedUsers(records, fn);
  }

  Model = require(path.join(__dirname, '..', '..', 'app', 'models', model + '.js'));
  var objs = await Promise.all(records.map(iterator));
  if (fn) {
    fn(objs);
  }
  return objs;
};

async function iterator(record){
  return Model.create(record);
}

async function seedUsers(records, fn) {
  var users = records.map(function(record) {
    var user = {
      email: record.email,
      isValid: record.isValid !== false,
      joinedOn: record.joinedOn ? new Date(record.joinedOn) : new Date()
    };

    if (record._id) {
      user._id = new ObjectId(record._id);
    } else {
      user._id = new ObjectId();
    }

    // Allow plaintext in fixtures while storing secure hashes in DB.
    if (record.password && record.password.indexOf('$2') === 0) {
      user.password = record.password;
    } else {
      user.password = bcrypt.hashSync(record.password || 'password', 8);
    }

    return user;
  });

  await db.getCollection('users').insertMany(users);
  if (fn) {
    fn(users);
  }
  return users;
}
