var Mongo = require('mongodb');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var request = require('request');

var getUserCollection = function() {
  if (!global.nss || !global.nss.db) {
    throw new Error('Database not initialized');
  }
  return global.nss.db.collection('users');
};

class User {
  static create (obj, fn){
    var message;
    getUserCollection().findOne({email: obj.email}, (e, u)=>{
      if (!u){
        var user = new User();
        user._id = new Mongo.ObjectId(obj._id);
        user.email = obj.email;
        user.password = '';
        user.joinedOn = new Date();
        user.isValid = false;
        getUserCollection().insertOne(user, ()=>{
          sendVerificationEmail(user, fn);
        });
      }else{
        message = 'already registered';
        fn(null, message);
      }
    });
    //end of create
  }

static login (obj, fn){
  var message;
  console.log('LOGIN ATTEMPT:', obj.email);
  getUserCollection().findOne({email: obj.email}, (e,u)=>{
    console.log('USER FOUND:', u ? 'yes' : 'no');
    if (u){
      console.log('COMPARING PASSWORDS');
      var isMatch = bcrypt.compareSync(obj.password, u.password);
      console.log('PASSWORD MATCH:', isMatch);
      console.log('IS VALID:', u.isValid);
      if (isMatch && u.isValid){
        fn(u);
      }else{
        message = u.isValid ? 'incorrect password' : 'unverified account, please respond to the verification email sent when you registered';
        console.log('LOGIN FAILED:', message);
        fn(null, message);
      }
    }else{
      message = 'no user registered with ' + obj.email;
      console.log('NO USER FOUND');
      fn(null, message);
    }
  });
}

  changePassword(password, fn){
    this.password = bcrypt.hashSync(password, 8);
    this.isValid = true;
    getUserCollection().updateOne({_id: this._id}, {$set: {password: this.password, isValid: this.isValid}}, ()=>{
      fn();
    });
  }

  static findById (id, fn) {

    id = new Mongo.ObjectId(id);
    getUserCollection().findOne({_id:id}, (e, u)=>{
      if (u) {
        u = _.create(User.prototype, u);
        fn(u);
      } else {
        fn(null);
      }
    });
  } //end of findById

} //end of user

function sendVerificationEmail(user, fn){
  'use strict';
  if (process.env.NODE_ENV === 'test') {
    var testMessage = `an account verification email has been sent to ${user.email}`;
    fn(user, testMessage);
    return;
  }

  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandboxf8003fd796e54c60bc6cc0b82a62f4e8.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
  var message = `an account verification email has been sent to ${user.email}`;
    fn(user, message);
  });

  var form = post.form();
  form.append('from', 'postmaster@dj-list.willdaly.co');
  form.append('to', user.email);
  form.append('subject', 'verify your DJ-List account');
  // form.append('html', `<a href="http://localhost:3000/verify/${user._id}">Click to verify your DJ-List account</a>`);
  form.append('html', `<a href="http://dj-list.willdaly.co/verify/${user._id}">Click to verify your DJ-List account</a>`);
}

module.exports = User;
