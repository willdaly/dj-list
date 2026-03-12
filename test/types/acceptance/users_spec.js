/* global describe, before, beforeEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

var expect = require('chai').expect;
var db = require(__dirname + '/../../helpers/db.js');
var factory = require(__dirname + '/../../helpers/factory.js');
var dbState = require(__dirname + '/../../../app/lib/db.js');
var app = require('../../../app/app');
var request = require('supertest');

var User;

describe('users', function(){

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

  describe('GET /login', function(){
    it('should show the login page', function(done){
      request(app)
      .get('/login')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });
  }); //end of login page

  describe('POST /login', function(){
    it('should login an existing user', function(done){
      request(app)
      .post('/login')
      .send('email=will@nss.com')
      .send('password=password')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    }); // login user success
    it('should not login an existing user, bad email', function(done){
      request(app)
      .post('/login')
      .send('email=willyd@nss.com')
      .send('password=password')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    }); //login user fail bad email
    it('should not login an existing user, bad password', function(done){
      request(app)
      .post('/login')
      .send('email=will@nss.com')
      .send('password=wrong')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    }); // login user fail bad password
  }); // login a user

  describe('POST /logout', function(){
    it('should logout an existing user', function(done){
      request(app)
      .post('/logout')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    }); //logout success
  }); //logout

  describe('POST /users', function(){
    it('should create a new user', function(done){
      request(app)
      .post('/users')
      .send('email=rwd@nss.com')
      .send('password=password')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    }); // .create success
    it('should not create a new user', function(done){
      request(app)
      .post('/users')
      .send('email=will@nss.com')
      .send('password=whatever')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    }); // .create fail, user already exists

  }); //end of create

}); //end of users
