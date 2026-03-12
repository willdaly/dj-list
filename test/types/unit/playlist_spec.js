/* global describe, before, beforeEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

const path = require('path');
const expect = require('chai').expect;
const db = require(path.join(__dirname, '..', '..', 'helpers', 'db.js'));
const factory = require(path.join(__dirname, '..', '..', 'helpers', 'factory.js'));
const dbState = require(path.join(__dirname, '..', '..', '..', 'app', 'lib', 'db.js'));
const Mongo = require('mongodb');

let Playlist;
let testUserId;
let testSongIds;

describe('Playlist', function () {
  before(async function () {
    await db();
    Playlist = require(path.join(__dirname, '..', '..', '..', 'app', 'models', 'playlist.js'));
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
    const songs = await factory('song');
    const users = await dbState.getCollection('users').find().toArray();
    testUserId = users[0]._id;
    testSongIds = songs.map((s) => s._id.toString());
  });

  describe('.create', function () {
    it('should create an empty playlist', async function () {
      const playlist = await Playlist.create({ name: 'My Playlist' }, testUserId);
      expect(playlist).to.be.ok;
      expect(playlist.name).to.equal('My Playlist');
      expect(playlist.userId).to.deep.equal(testUserId);
      expect(playlist.songs).to.be.an('array');
      expect(playlist.songs).to.have.lengthOf(0);
    });

    it('should create playlist with songs', async function () {
      const playlist = await Playlist.create(
        { name: 'With Songs', songIds: testSongIds.slice(0, 2) },
        testUserId
      );
      expect(playlist).to.be.ok;
      expect(playlist.songs).to.have.lengthOf(2);
    });

    it('should return null when duplicate name for same user', async function () {
      await Playlist.create({ name: 'Duplicate' }, testUserId);
      const second = await Playlist.create({ name: 'Duplicate' }, testUserId);
      expect(second).to.be.null;
    });

    it('should allow same name for different users', async function () {
      const otherUser = new Mongo.ObjectId();
      await Playlist.create({ name: 'Shared Name' }, testUserId);
      const p2 = await Playlist.create({ name: 'Shared Name' }, otherUser);
      expect(p2).to.be.ok;
    });
  });

  describe('.index', function () {
    it('should return playlists for user', async function () {
      await Playlist.create({ name: 'P1' }, testUserId);
      await Playlist.create({ name: 'P2' }, testUserId);
      const list = await Playlist.index(testUserId);
      expect(list).to.have.lengthOf(2);
    });
  });

  describe('.show', function () {
    it('should return songs for playlist', async function () {
      const created = await Playlist.create(
        { name: 'Show Test', songIds: testSongIds.slice(0, 1) },
        testUserId
      );
      const songs = await Playlist.show(created._id.toString(), testUserId);
      expect(songs).to.be.an('array');
      expect(songs).to.have.lengthOf(1);
    });

    it('should return null for wrong user', async function () {
      const created = await Playlist.create({ name: 'Private' }, testUserId);
      const otherUser = new Mongo.ObjectId();
      const songs = await Playlist.show(created._id.toString(), otherUser);
      expect(songs).to.be.null;
    });
  });
});
