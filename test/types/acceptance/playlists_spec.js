/* global describe, before, beforeEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

const path = require('path');
const expect = require('chai').expect;
const db = require(path.join(__dirname, '..', '..', 'helpers', 'db.js'));
const factory = require(path.join(__dirname, '..', '..', 'helpers', 'factory.js'));
const dbState = require(path.join(__dirname, '..', '..', '..', 'app', 'lib', 'db.js'));
const app = require('../../../app/app');
const request = require('supertest');

describe('playlists routes', function () {
  before(async function () {
    await db();
  });

  beforeEach(async function () {
    try {
      await dbState.getCollection('playlists').drop();
    } catch {
      // ignore
    }
    try {
      await dbState.getCollection('songs').drop();
    } catch {
      // ignore
    }
    try {
      await dbState.getCollection('users').drop();
    } catch {
      // ignore
    }
    await factory('user');
    await factory('song');
  });

  it('POST /playlists should return user playlists', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const res = await agent.post('/playlists');
    expect(res.status).to.equal(200);
    expect(res.body.playlists).to.be.an('array');
  });

  it('POST /createPlaylist should create playlist', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const songs = await dbState.getCollection('songs').find().toArray();
    const songIds = songs.slice(0, 1).map((s) => s._id.toString());
    const body = 'name=Acceptance+Test+Playlist&' + songIds.map((id) => 'songIds[]=' + encodeURIComponent(id)).join('&');
    const res = await agent.post('/createPlaylist').type('form').send(body);
    expect(res.status).to.equal(200);
    expect(res.body.playlist).to.be.ok;
    expect(res.body.playlist.name).to.equal('Acceptance Test Playlist');
  });

  it('POST /playlists/:id should return playlist songs', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const songs = await dbState.getCollection('songs').find().toArray();
    const songIds = songs.slice(0, 1).map((s) => s._id.toString());
    const body = 'name=Show+Test&' + songIds.map((id) => 'songIds[]=' + encodeURIComponent(id)).join('&');
    const createRes = await agent.post('/createPlaylist').type('form').send(body);
    const playlistId = createRes.body.playlist._id;
    const res = await agent.post(`/playlists/${playlistId}`);
    expect(res.status).to.equal(200);
    expect(res.body.songs).to.be.an('array');
    expect(res.body.songs.length).to.equal(1);
  });
});
