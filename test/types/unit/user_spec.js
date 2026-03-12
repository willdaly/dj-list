/* global describe, before, beforeEach, it */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'dj-list';

var expect = require('chai').expect;
var db = require(__dirname + '/../../helpers/db.js');
var factory = require(__dirname + '/../../helpers/factory.js');
var dbState = require(__dirname + '/../../../app/lib/db.js');
var Mongo = require('mongodb');

var User;

describe('User', function(){
  before(async function(){
    await db();
    User = require(__dirname + '/../../../app/models/user.js');
  }); //end of before


  beforeEach(async function(){
    try {
      await dbState.getCollection('users').drop();
    } catch (err) {
      // ignore namespace not found when collection doesn't exist yet
    }
    await factory('user');
  }); //end of beforeEach

  describe('.create', function(){
    it('should successfully create a user', async function(){
      var result = await User.create({email: 'willyd@nss.com', password: 'password'});
      var u = result.user;
      expect(u).to.be.ok;
      expect(u).to.be.an.instanceof(User);
      expect(u._id).to.be.an.instanceof(Mongo.ObjectId);
      expect(u.password).to.equal('');
      expect(u.isValid).to.equal(false);
    }); //end of create success
    it('should NOT successfully create a user', async function(){
      var result = await User.create({email: 'will@nss.com', password: 'already registered'});
      expect(result.user).to.be.null;
    }); //end of create unsucces
  }); //end of create

  describe('.login', function(){
    it('should successfully login a user', async function(){
      var result = await User.login({email: 'will@nss.com', password: 'password'});
      expect(result.user).to.be.ok;
    }); //end of login success
    it('should NOT login user - bad password', async function(){
      var result = await User.login({email: 'will@nss.com', password: 'gobbldeygook'});
      expect(result.user).to.be.null;
    }); //end of login bad pass
    it('should Not login user - bad email', async function(){
      var result = await User.login({email: 'bad@nss.com', password: 'password'});
      expect(result.user).to.be.null;
    }); //end of login bad email
  }); //end of login

  describe('.findById', function(){
    it('should successfully find a user', async function(){
      var u = await User.findById('1234567890abcdef12345678');
      expect(u).to.be.instanceof(User);
      expect(u.email).to.equal('will@nss.com');
    }); //end of successfully find user
    it('should NOT successfully find a user - Bad Id', async function(){
      var u = await User.findById('132435465768abcdef098765');
      expect(u).to.be.null;
    }); //end of unsuccessfully find user bad id
    it ('should NOT successfully find a user - user doesnt exist', async function(){
      var u = await User.findById('0987654321abcdef09876543');
      expect(u).to.be.null;
    }); //end of unsuccessfully find user, doesnt exist
  }); //end of findById
}); //end of user
