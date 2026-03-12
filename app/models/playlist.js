const ObjectId = require('mongodb').ObjectId;
const db = require(__dirname + '/../lib/db.js');

function getPlaylistsCollection() {
  return db.getCollection('playlists');
}

function getSongsCollection() {
  return db.getCollection('songs');
}

function sortByOrder(a, b) {
  return a.order - b.order;
}

class Playlist {
  static async create (obj, userId){
    const songsArray = [];
    const sArray = [];
    if (obj.songIds) {
      obj.songIds.forEach(song=>{
        const mongoid = new ObjectId(song);
        songsArray.push(mongoid);
      });
    }

    const songs = await getSongsCollection().find({_id: {$in: songsArray}}).toArray();
    if (songs) {
      let order = 1;
      songs.forEach(song=>{
        song.order = order;
        order++;
        sArray.push(song);
      });
    }

    const existing = await getPlaylistsCollection().findOne({name: obj.name});
    if (existing) {
      return null;
    }

    const playlist = new Playlist();
    playlist._id = obj._id ? new ObjectId(obj._id) : new ObjectId();
    playlist.name = obj.name;
    playlist.userId = userId;
    playlist.songs = sArray;
    await getPlaylistsCollection().insertOne(playlist);
    return playlist;
  }

  static async addSongs (obj, userId) {
    const _id = new ObjectId(obj.playlistId);
    const playlist = await getPlaylistsCollection().findOne({_id: _id, userId: userId});
    if (!playlist) {
      return null;
    }
    const songsArray = [];
    obj.songIds.forEach(song=>{
      const mongoid = new ObjectId(song);
      songsArray.push(mongoid);
    });
    const songs = await getSongsCollection().find({_id: {$in: songsArray}}).toArray();
    if (!songs) {
      return null;
    }
    let order = playlist.songs.length > 0 ? playlist.songs.length + 1 : 1;
    songs.forEach(song=>{
      song.order = order;
      playlist.songs.push(song);
      order++;
    });
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }

  static async updateOrder (obj, playlistId, userId) {
    const _id = new ObjectId(playlistId);
    const oldOrder = parseInt(obj.oldOrder);
    const newOrder = parseInt(obj.newOrder);
    const playlist = await getPlaylistsCollection().findOne({_id: _id, userId: userId});
    if (!playlist) {
      return null;
    }
    const direction = newOrder - oldOrder;
    playlist.songs.forEach(song=>{
      if (direction > 0){
        if (song.order > oldOrder && song.order <= newOrder ) {
          song.order = song.order-1;
        }
        if (song.Song === obj.songTitle){
          song.order = newOrder;
        }
      } else {
        if (song.order < oldOrder && song.order >= newOrder ) {
          song.order = song.order+1;
        }
        if (song.Song === obj.songTitle){
          song.order = newOrder;
        }
      }
    });
    playlist.songs.sort(sortByOrder);
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }

  static async rename (obj, userId) {
    const _id = new ObjectId(obj.playlistId);
    const playlist = await getPlaylistsCollection().findOne({_id: _id, userId: userId});
    if (!playlist) {
      return null;
    }
    playlist.name = obj.newName;
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }

  static async index (userId){
    return getPlaylistsCollection().find({userId : userId}).toArray();
  }

  static async deletePlaylist (id, userId) {
    const _id = new ObjectId(id);
    await getPlaylistsCollection().findOneAndDelete({_id: _id, userId: userId});
    return getPlaylistsCollection().find({userId: userId}).toArray();
  }

  static async show (playlistId, userId) {
    const _id = new ObjectId(playlistId);
    const playlist = await getPlaylistsCollection().findOne({_id: _id, userId: userId});
    if (!playlist) {
      return null;
    }
    return playlist.songs.sort(sortByOrder);
  }

  static async deleteFromPlaylist (songIds, playlistId, userId) {
    const _id = new ObjectId(playlistId);
    const playlist = await getPlaylistsCollection().findOne({_id: _id, userId: userId});
    if (!playlist) {
      return null;
    }

    const songIdsArray = [];
    songIds.forEach(songId=>{
      const mongoid = new ObjectId(songId);
      songIdsArray.push(mongoid);
    });
    const songs = await getSongsCollection().find({_id: {$in: songIdsArray}}).toArray();
    songs.forEach(s=>{
      playlist.songs.forEach(song=>{
        if (s.Song === song.Song){
          const index = playlist.songs.indexOf(song);
          playlist.songs.splice(index, 1);
        }
      });
    });
    playlist.songs.sort(sortByOrder);
    let order = 1;
    playlist.songs.forEach(song=>{
      song.order = order;
      order++;
    });
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }
}

module.exports = Playlist;