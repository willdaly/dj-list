var userCollection = global.nss.db.collection('users');
var Mongo = require('mongodb');
var bcrypt = require('bcrypt');
var _ = require('lodash');


class User {
  static create (obj, fn){
    var message;
    userCollection.findOne({email: obj.email}, (e, u)=>{
      if (!u){
        if (obj.email.length > 5 &&  obj.password !== 'password' && obj.password.length > 8) {
          var user = new User();
          user._id = Mongo.ObjectID(obj._id);
          user.email = obj.email;
          user.password = bcrypt.hashSync(obj.password, 8);
          userCollection.save(user, ()=>fn(user, null));
        } else {
          message = 'email or password too short or obvious';
          fn(null, message);
        }

      }else{
        message = 'already registered';
        fn(null, message);
      }
    });
    //end of create
  }

  static login (obj, fn){
    userCollection.findOne({email: obj.email}, (e,u)=>{
      if (u){
        var isMatch = bcrypt.compareSync(obj.password, u.password);
        if (isMatch){
          fn(u);
        }else{
          fn(null);
        }
      }else{
        fn(null);
      }
    });
  } //end of login

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

module.exports = User;
