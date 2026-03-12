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

describe('songs routes', function () {
  before(async function () {
    await db();
    await dbState.getCollection('songs').createIndex({ Artist: 'text' });
  });

  beforeEach(async function () {
    try {
      await dbState.getCollection('songs').drop();
    } catch (err) {
      // ignore
    }
    try {
      await dbState.getCollection('users').drop();
    } catch (err) {
      // ignore
    }
    await factory('user');
    await factory('song');
    await dbState.getCollection('songs').createIndex({ Artist: 'text' });
  });

  it('POST /createSong should create a song', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const res = await agent
      .post('/createSong')
      .type('form')
      .send({
        Artist: 'New Artist',
        Album: 'New Album',
        Title: 'New Song',
        BPM: 100,
        Key: 'AbM',
        genre: 'Hip-Hop'
      });
    expect(res.status).to.equal(200);
    expect(res.body.songs).to.be.ok;
    expect(res.body.songs.Artist).to.equal('New Artist');
  });

  it('POST /genreFilter should return songs by genre', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const res = await agent.post('/genreFilter').type('form').send('genre[]=Hip-Hop');
    expect(res.status).to.equal(200);
    expect(res.body.songs).to.be.an('array');
    expect(res.body.songs.length).to.be.at.least(1);
  });

  it('POST /key should return songs by key', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const res = await agent.post('/key').type('form').send('Key=AbM&genre[]=Hip-Hop');
    expect(res.status).to.equal(200);
    expect(res.body.songs).to.be.an('array');
  });

  it('POST /search should return songs matching query', async function () {
    const agent = request.agent(app);
    await agent.get('/test/login');
    const res = await agent.post('/search').type('form').send({ query: 'Test' });
    expect(res.status).to.equal(200);
    expect(res.body.songs).to.be.an('array');
  });
});
