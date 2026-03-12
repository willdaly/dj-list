/* global describe, before, beforeEach, afterEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

const path = require('path');
const expect = require('chai').expect;
const db = require(path.join(__dirname, '..', '..', 'helpers', 'db.js'));
const factory = require(path.join(__dirname, '..', '..', 'helpers', 'factory.js'));
const dbState = require(path.join(__dirname, '..', '..', '..', 'app', 'lib', 'db.js'));
const app = require('../../../app/app');
const request = require('supertest');

describe('users', function(){
  let originalSpotifyClientId;
  let originalSpotifyRedirectUri;

  before(async function(){
    await db();
    originalSpotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    originalSpotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;
  });

  afterEach(function(){
    process.env.SPOTIFY_CLIENT_ID = originalSpotifyClientId;
    process.env.SPOTIFY_REDIRECT_URI = originalSpotifyRedirectUri;
  });

  beforeEach(async function(){
    try {
      await dbState.getCollection('users').drop();
    } catch {
      // ignore namespace not found when collection doesn't exist yet
    }
    await factory('user');
  });

  describe('GET /', function(){
    it('should render react shell', async function(){
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('/assets-react/app.js');
    });
  });

  describe('GET /auth/spotify', function(){
    it('should redirect to spotify when configured', async function(){
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_REDIRECT_URI = 'http://localhost:4000/auth/spotify/callback';
      const res = await request(app).get('/auth/spotify');
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.contain('https://accounts.spotify.com/authorize?');
    });

    it('should fail when spotify env is missing', async function(){
      delete process.env.SPOTIFY_CLIENT_ID;
      delete process.env.SPOTIFY_REDIRECT_URI;
      const res = await request(app).get('/auth/spotify');
      expect(res.status).to.equal(500);
    });
  });

  describe('GET /auth/spotify/callback', function(){
    it('should reject callback without valid state', async function(){
      const res = await request(app).get('/auth/spotify/callback?code=abc&state=wrong');
      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/session', function(){
    it('should return unauthenticated state for anonymous requests', async function(){
      const res = await request(app).get('/api/session');
      expect(res.status).to.equal(200);
      expect(res.body.authenticated).to.equal(false);
      expect(res.body.user).to.equal(null);
    });

    it('should return authenticated state for logged in users', async function(){
      const agent = request.agent(app);
      const loginRes = await agent.get('/test/login');
      expect(loginRes.status).to.equal(204);
      const res = await agent.get('/api/session');
      expect(res.status).to.equal(200);
      expect(res.body.authenticated).to.equal(true);
      expect(res.body.user).to.be.an('object');
      expect(res.body.user.spotifyId).to.equal('smoke-test-user');
    });
  });

  describe('POST /logout', function(){
    it('should logout an existing user', async function(){
      const res = await request(app).post('/logout');
      expect(res.status).to.equal(200);
    });
  });

});
