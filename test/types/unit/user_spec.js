/* global describe, before, beforeEach, it */
'use strict';

process.env.DBNAME = 'dj-list';

const path = require('path');
const expect = require('chai').expect;
const db = require(path.join(__dirname, '..', '..', 'helpers', 'db.js'));
const factory = require(path.join(__dirname, '..', '..', 'helpers', 'factory.js'));
const dbState = require(path.join(__dirname, '..', '..', '..', 'app', 'lib', 'db.js'));
const Mongo = require('mongodb');

let User;

describe('User', function(){
  before(async function(){
    await db();
    User = require(path.join(__dirname, '..', '..', '..', 'app', 'models', 'user.js'));
  }); //end of before


  beforeEach(async function(){
    try {
      await dbState.getCollection('users').drop();
    } catch (err) {
      // ignore namespace not found when collection doesn't exist yet
    }
    await factory('user');
  }); //end of beforeEach

  describe('.findOrCreateFromSpotify', function(){
    it('should create a new user for a new spotify profile', async function(){
      const u = await User.findOrCreateFromSpotify({
        id: 'spotify-user-1',
        email: 'willyd@nss.com',
        display_name: 'Will Daly'
      });

      expect(u).to.be.ok;
      expect(u).to.be.an.instanceof(User);
      expect(u._id).to.be.an.instanceof(Mongo.ObjectId);
      expect(u.spotifyId).to.equal('spotify-user-1');
      expect(u.email).to.equal('willyd@nss.com');
      expect(u.isValid).to.equal(true);
    });

    it('should return existing spotify user', async function(){
      await User.findOrCreateFromSpotify({
        id: 'spotify-user-existing',
        email: 'will@nss.com',
        display_name: 'Will'
      });

      const u = await User.findOrCreateFromSpotify({
        id: 'spotify-user-existing',
        email: 'ignored@nss.com',
        display_name: 'Ignored'
      });

      expect(u).to.be.ok;
      expect(u.spotifyId).to.equal('spotify-user-existing');
      expect(u.email).to.equal('will@nss.com');
    });

    it('should link an existing email user to spotify', async function(){
      const u = await User.findOrCreateFromSpotify({
        id: 'spotify-linked',
        email: 'will@nss.com',
        display_name: 'Linked User'
      });

      expect(u).to.be.ok;
      expect(u.spotifyId).to.equal('spotify-linked');
      expect(u.email).to.equal('will@nss.com');
      expect(u.isValid).to.equal(true);
    });
  });

  describe('.findById', function(){
    it('should successfully find a user', async function(){
      const u = await User.findById('1234567890abcdef12345678');
      expect(u).to.be.instanceof(User);
      expect(u.email).to.equal('will@nss.com');
    }); //end of successfully find user
    it('should NOT successfully find a user - Bad Id', async function(){
      const u = await User.findById('132435465768abcdef098765');
      expect(u).to.be.null;
    }); //end of unsuccessfully find user bad id
    it ('should NOT successfully find a user - user doesnt exist', async function(){
      const u = await User.findById('0987654321abcdef09876543');
      expect(u).to.be.null;
    }); //end of unsuccessfully find user, doesnt exist
  }); //end of findById
}); //end of user
