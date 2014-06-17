/* global describe, before, beforeEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

var expect = require('chai').expect;
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var factory = traceur.require(__dirname + '/../../helpers/factory.js');
var app = require('../../../app/app');
var request = require('supertest');

var User;

describe('users', function(){

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
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/login');
        done();
      });
    }); //login user fail bad email
    it('should not login an existing user, bad password', function(done){
      request(app)
      .post('/login')
      .send('email=will@nss.com')
      .send('password=wrong')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/login');
        done();
      });
    }); // login user fail bad password
  }); // login a user

  describe('POST /logout', function(){
    it('should logout an existing user', function(done){
      request(app)
      .post('/logout')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
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
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    }); // .create success
    it('should not create a new user', function(done){
      request(app)
      .post('/users')
      .send('email=will@nss.com')
      .send('password=whatever')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.header.location).to.equal('/login');
        done();
      });
    }); // .create fail, user already exists

  }); //end of create

}); //end of users
