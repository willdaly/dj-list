var userCollection = global.nss.db.collection('users');
var Mongo = require('mongodb');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var request = require('request');

class User {
  static create (obj, fn){
    var message;
    userCollection.findOne({email: obj.email}, (e, u)=>{
      if (!u){
        var user = new User();
        user._id = Mongo.ObjectID(obj._id);
        user.email = obj.email;
        user.password = '';
        user.joinedOn = new Date();
        user.isValid = false;
        userCollection.save(user, ()=>{
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
    userCollection.findOne({email: obj.email}, (e,u)=>{
      if (u){
        var isMatch = bcrypt.compareSync(obj.password, u.password);
        if (isMatch && u.isValid){
          fn(u);
        }else{
          message = u.isValid ? 'incorrect password' : 'unverified account, please respond to the verification email sent when you registered';
          fn(null, message);
        }
      }else{
        message = 'no user registered with ' + obj.email;
        fn(null, message);
      }
    });
  } //end of login

  changePassword(password, fn){
    this.password = bcrypt.hashSync(password, 8);
    this.isValid = true;
    userCollection.save(this, fn);
  }

  static findById (id, fn) {

    id = Mongo.ObjectID(id);
    userCollection.findOne({_id:id}, (e, u)=>{
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
  var key = process.env.MAILGUN;
  // var url = 'https://api:' + key + '@api.mailgun.net/v2/sandboxf8003fd796e54c60bc6cc0b82a62f4e8.mailgun.org/messages';
  var url = 'https://api:' + key + '@api.mailgun.net/v2/dj-list.willdaly.co/messages';
  var post = request.post(url, function(err, response, body){
  var message = `an account verification email has been sent to ${user.email}`;
    fn(user, message);
  });

  var form = post.form();
  form.append('from', 'postmaster@dj-list.willdaly.co');
  form.append('to', user.email);
  form.append('subject', 'verify your DJ-List account');
  form.append('html', `<a href="http://localhost:3000/verify/${user._id}">Click to verify your DJ-List account</a>`);
}

module.exports = User;
