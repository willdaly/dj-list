/* global describe, before, beforeEach, afterEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

var expect = require('chai').expect;
var db = require(__dirname + '/../../helpers/db.js');
var factory = require(__dirname + '/../../helpers/factory.js');
var dbState = require(__dirname + '/../../../app/lib/db.js');
var app = require('../../../app/app');
var request = require('supertest');

describe('users', function(){
  var originalSpotifyClientId;
  var originalSpotifyRedirectUri;

  before(async function(){
    await db();
    originalSpotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    originalSpotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;
  }); //end of before

  afterEach(function(){
    process.env.SPOTIFY_CLIENT_ID = originalSpotifyClientId;
    process.env.SPOTIFY_REDIRECT_URI = originalSpotifyRedirectUri;
  });

  beforeEach(async function(){
    try {
      await dbState.getCollection('users').drop();
    } catch (err) {
      // ignore namespace not found when collection doesn't exist yet
    }
    await factory('user');
  }); //end of beforeEach

  describe('GET /', function(){
    it('should show the landing page', function(done){
      request(app)
      .get('/')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });
  }); //end of landing page

  describe('GET /auth/spotify', function(){
    it('should redirect to spotify when configured', function(done){
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_REDIRECT_URI = 'http://localhost:4000/auth/spotify/callback';
      request(app)
      .get('/auth/spotify')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.contain('https://accounts.spotify.com/authorize?');
        done();
      });
    });

    it('should fail when spotify env is missing', function(done){
      delete process.env.SPOTIFY_CLIENT_ID;
      delete process.env.SPOTIFY_REDIRECT_URI;
      request(app)
      .get('/auth/spotify')
      .end(function(err, res){
        expect(res.status).to.equal(500);
        done();
      });
    });
  });

  describe('GET /auth/spotify/callback', function(){
    it('should reject callback without valid state', function(done){
      request(app)
      .get('/auth/spotify/callback?code=abc&state=wrong')
      .end(function(err, res){
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

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

}); //end of users
