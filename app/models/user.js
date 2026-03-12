var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var _ = require('lodash');
var request = require('request');
var db = require(__dirname + '/../lib/db.js');

var getUserCollection = function() {
  return db.getCollection('users');
};

class User {
  static async create (obj){
    var existing = await getUserCollection().findOne({email: obj.email});
    if (existing) {
      return {user: null, message: 'already registered'};
    }

    var user = new User();
    user._id = new ObjectId(obj._id);
    user.email = obj.email;
    user.password = '';
    user.joinedOn = new Date();
    user.isValid = false;

    await getUserCollection().insertOne(user);
    var message = await sendVerificationEmail(user);
    return {user: user, message: message};
  }

  static async login (obj){
    var message;
    var user = await getUserCollection().findOne({email: obj.email});
    if (user){
      var isMatch = bcrypt.compareSync(obj.password, user.password);
      if (isMatch && user.isValid){
        return {user: user, message: null};
      }
      message = user.isValid ? 'incorrect password' : 'unverified account, please respond to the verification email sent when you registered';
      return {user: null, message: message};
    }

    message = 'no user registered with ' + obj.email;
    return {user: null, message: message};
  }

  async changePassword(password){
    this.password = bcrypt.hashSync(password, 8);
    this.isValid = true;
    await getUserCollection().updateOne({_id: this._id}, {$set: {password: this.password, isValid: this.isValid}});
  }

  static async findById (id) {
    var user = await getUserCollection().findOne({_id: new ObjectId(id)});
    if (!user) {
      return null;
    }
    return _.create(User.prototype, user);
  }

} //end of user

function sendVerificationEmail(user){
  'use strict';
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve(`an account verification email has been sent to ${user.email}`);
  }
  return new Promise(function(resolve, reject) {
    var key = process.env.MAILGUN;
    var url = 'https://api:' + key + '@api.mailgun.net/v2/sandboxf8003fd796e54c60bc6cc0b82a62f4e8.mailgun.org/messages';
    var post = request.post(url, function(err){
      if (err) {
        return reject(err);
      }
      return resolve(`an account verification email has been sent to ${user.email}`);
    });

    var form = post.form();
    form.append('from', 'postmaster@dj-list.willdaly.co');
    form.append('to', user.email);
    form.append('subject', 'verify your DJ-List account');
    // form.append('html', `<a href="http://localhost:3000/verify/${user._id}">Click to verify your DJ-List account</a>`);
    form.append('html', `<a href="http://dj-list.willdaly.co/verify/${user._id}">Click to verify your DJ-List account</a>`);
  });
}

module.exports = User;
