'use strict';

const fs = require('fs');
const path = require('path');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const db = require(path.join(__dirname, '..', '..', 'app', 'lib', 'db.js'));
let Model;

module.exports = async (model, fn)=>{
  const fixturePath = path.join(__dirname, '..', 'fixtures', model + '.json');
  let records = fs.readFileSync(fixturePath, 'utf8');
  records = JSON.parse(records);

  if (model === 'user') {
    return seedUsers(records, fn);
  }

  Model = require(path.join(__dirname, '..', '..', 'app', 'models', model + '.js'));
  const objs = await Promise.all(records.map(iterator));
  if (fn) {
    fn(objs);
  }
  return objs;
};

async function iterator(record){
  return Model.create(record);
}

async function seedUsers(records, fn) {
  const users = records.map(function(record) {
    const user = {
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
    if (record.password && record.password.startsWith('$2')) {
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
