/* global describe, before, beforeEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

const path = require('path');
const expect = require('chai').expect;
const db = require(path.join(__dirname, '..', '..', 'helpers', 'db.js'));
const factory = require(path.join(__dirname, '..', '..', 'helpers', 'factory.js'));
const dbState = require(path.join(__dirname, '..', '..', '..', 'app', 'lib', 'db.js'));

let Song;

describe('Song', function () {
  before(async function () {
    await db();
    Song = require(path.join(__dirname, '..', '..', '..', 'app', 'models', 'song.js'));
  });

  beforeEach(async function () {
    try {
      await dbState.getCollection('songs').drop();
    } catch {
      // ignore namespace not found
    }
    await factory('song');
    await dbState.getCollection('songs').createIndex({ Artist: 'text' });
  });

  describe('.create', function () {
    it('should create a song with required fields', async function () {
      const song = await Song.create({
        Artist: 'New Artist',
        Album: 'New Album',
        Title: 'New Song',
        BPM: 120,
        Key: 'CM',
        genre: 'House'
      });
      expect(song).to.be.ok;
      expect(song._id).to.be.ok;
      expect(song.Artist).to.equal('New Artist');
      expect(song.Album).to.equal('New Album');
      expect(song.Song).to.equal('New Song');
      expect(song.BPM).to.equal(120);
      expect(song.Key).to.equal('CM');
      expect(song.genre).to.equal('House');
    });
  });

  describe('.findByKey', function () {
    it('should return songs matching key and genre', async function () {
      const songs = await Song.findByKey({ Key: 'AbM', genre: ['Hip-Hop'] });
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.at.least(1);
      expect(songs[0].Key).to.equal('AbM');
    });
  });

  describe('.findByBPM', function () {
    it('should return songs in BPM range', async function () {
      const songs = await Song.findByBPM({ BPM: [90, 105], genre: ['Hip-Hop'] });
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.at.least(1);
      expect(songs[0].BPM).to.be.at.least(90);
      expect(songs[0].BPM).to.be.at.most(105);
    });
  });

  describe('.findByBpmKey', function () {
    it('should return songs matching BPM, key, and genre', async function () {
      const songs = await Song.findByBpmKey({
        BPM: [90, 105],
        Key: 'AbM',
        genre: ['Hip-Hop']
      });
      expect(songs).to.be.an('array');
    });
  });

  describe('.findByArtist', function () {
    it('should return songs by artist prefix', async function () {
      const songs = await Song.findByArtist('Test Artist');
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.at.least(2);
    });
  });

  describe('.findByGenre', function () {
    it('should return songs by genre', async function () {
      const songs = await Song.findByGenre(['Hip-Hop']);
      expect(songs).to.be.an('array');
      expect(songs.length).to.equal(3);
    });
  });

  describe('.findBySearchTerm', function () {
    it('should return empty array for empty term', async function () {
      const songs = await Song.findBySearchTerm('');
      expect(songs).to.deep.equal([]);
    });

    it('should return songs matching search tokens', async function () {
      const songs = await Song.findBySearchTerm('Test Artist');
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.at.least(1);
    });
  });

  describe('.editSong', function () {
    it('should update song and return it', async function () {
      const [existing] = await dbState.getCollection('songs').find().limit(1).toArray();
      const updated = await Song.editSong({
        Id: existing._id.toString(),
        Artist: 'Updated Artist',
        Title: existing.Song
      });
      expect(updated).to.be.ok;
      expect(updated.Artist).to.equal('Updated Artist');
    });

    it('should return null for non-existent song', async function () {
      const Mongo = require('mongodb');
      const result = await Song.editSong({
        Id: new Mongo.ObjectId().toString(),
        Artist: 'X'
      });
      expect(result).to.be.null;
    });
  });
});
