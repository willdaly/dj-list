/* global describe, before, beforeEach, it */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'dj-list';

var expect = require('chai').expect;
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var factory = traceur.require(__dirname + '/../../helpers/factory.js');
var Mongo = require('mongodb');

var User;

describe('User', function(){
  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  }); //end of before


  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      factory('user', function(users){
        done();
      });
    });
  }); //end of beforeEach

  describe('.create', function(){
    it('should successfully create a user', function(done){
      User.create({email: 'willyd@nss.com', password: 'password'}, function(u){
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceof(User);
        expect(u._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(u.password).to.have.length.above(59);
        done();
      });
    }); //end of create success
    it('should NOT successfully create a user', function(done){
      User.create({email: 'will@nss.com', password: 'already registered'}, function(u){
        expect(u).to.be.null;
        done();
      });
    }); //end of create unsucces
  }); //end of create

  describe('.login', function(){
    it('should successfully login a user', function(done){
      User.login({email: 'will@nss.com', password: 'password'}, function(u){
        expect(u).to.be.ok;
        done();
      });
    }); //end of login success
    it('should NOT login user - bad password', function(done){
      User.login({email: 'will@nss.com', password: 'gobbldeygook'}, function(u){
        expect(u).to.be.null;
        done();
      });
    }); //end of login bad pass
    it('should Not login user - bad email', function(done){
      User.login({email: 'bad@nss.com', password: 'password'}, function(u){
        expect(u).to.be.null;
        done();
      });
    }); //end of login bad email
  }); //end of login

  describe('.findById', function(){
    it('should successfully find a user', function(done){
      User.findById('1234567890abcdef12345678', function(u){
        expect(u).to.be.instanceof(User);
        expect(u.email).to.equal('will@nss.com');
        done();
      });
    }); //end of successfully find user
    it('should NOT successfully find a user - Bad Id', function(done){
      User.findById('132435465768abcdef098765', function(u){
        expect(u).to.be.null;
        done();
      });
    }); //end of unsuccessfully find user bad id
    it ('should NOT successfully find a user - user doesnt exist', function(done){
      User.findById('0987654321abcdef09876543', function(u){
        expect(u).to.be.null;
        done();
      });
    }); //end of unsuccessfully find user, doesnt exist
  }); //end of findById
}); //end of user
