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
  var originalReactUiEnabled;

  before(async function(){
    await db();
    originalSpotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    originalSpotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;
    originalReactUiEnabled = process.env.REACT_UI_ENABLED;
  }); //end of before

  afterEach(function(){
    process.env.SPOTIFY_CLIENT_ID = originalSpotifyClientId;
    process.env.SPOTIFY_REDIRECT_URI = originalSpotifyRedirectUri;
    process.env.REACT_UI_ENABLED = originalReactUiEnabled;
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

  describe('GET /api/session', function(){
    it('should return unauthenticated state for anonymous requests', function(done){
      request(app)
      .get('/api/session')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.body.authenticated).to.equal(false);
        expect(res.body.user).to.equal(null);
        done();
      });
    });

    it('should return authenticated state for logged in users', function(done){
      var agent = request.agent(app);
      agent.get('/test/login').end(function(loginErr, loginRes){
        expect(loginRes.status).to.equal(204);
        agent
        .get('/api/session')
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.body.authenticated).to.equal(true);
          expect(res.body.user).to.be.an('object');
          expect(res.body.user.spotifyId).to.equal('smoke-test-user');
          done();
        });
      });
    });
  });

  describe('GET /react', function(){
    it('should redirect to legacy page when feature flag is disabled', function(done){
      delete process.env.REACT_UI_ENABLED;
      request(app)
      .get('/react')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    });

    it('should render react shell when feature flag is enabled', function(done){
      process.env.REACT_UI_ENABLED = 'true';
      request(app)
      .get('/react')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('/assets-react/app.js');
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
