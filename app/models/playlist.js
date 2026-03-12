var ObjectId = require('mongodb').ObjectId;
var db = require(__dirname + '/../lib/db.js');

var getPlaylistsCollection = function() {
  return db.getCollection('playlists');
};

var getSongsCollection = function() {
  return db.getCollection('songs');
};

class Playlist {
  static async create (obj, userId){
    var songsArray = [];
    var sArray = [];
    if (obj.songIds) {
      obj.songIds.forEach(song=>{
        var mongoid =  new ObjectId(song);
        songsArray.push(mongoid);
      });
    }

    var songs = await getSongsCollection().find({_id: {$in: songsArray}}).toArray();
    if (songs) {
      var order = 1;
      songs.forEach(song=>{
        song.order = order;
        order++;
        sArray.push(song);
      });
    }

    var existing = await getPlaylistsCollection().findOne({name: obj.name});
    if (existing) {
      return null;
    }

    var playlist = new Playlist();
    playlist._id = new ObjectId(obj._id);
    playlist.name = obj.name;
    playlist.userId = userId;
    playlist.songs = sArray;
    await getPlaylistsCollection().insertOne(playlist);
    return playlist;
  }

  static async addSongs (obj) {
    var _id = new ObjectId(obj.playlistId);
    var playlist = await getPlaylistsCollection().findOne({_id:_id});
    if (!playlist) {
      return null;
    }
    var songsArray = [];
    obj.songIds.forEach(song=>{
      var mongoid =  new ObjectId(song);
      songsArray.push(mongoid);
    });
    var songs = await getSongsCollection().find({_id: {$in: songsArray}}).toArray();
    if (!songs) {
      return null;
    }
    var order = playlist.songs.length > 0 ? playlist.songs.length + 1 : 1;
    songs.forEach(song=>{
      song.order = order;
      playlist.songs.push(song);
      order++;
    });
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }

  static async updateOrder (obj, playlistId) {
    var _id = new ObjectId(playlistId);
    var oldOrder = parseInt(obj.oldOrder);
    var newOrder = parseInt(obj.newOrder);
    var playlist = await getPlaylistsCollection().findOne({_id : _id});
    if (!playlist) {
      return null;
    }
    var direction = newOrder - oldOrder;
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
    playlist.songs.sort((a, b)=>{
      if (a.order > b.order){
        return 1;
      }else{
        return -1;
      }
    });
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }

  static async rename (obj) {
    var _id = new ObjectId(obj.playlistId);
    var playlist = await getPlaylistsCollection().findOne({_id:_id});
    if (!playlist){
      return null;
    }
    playlist.name = obj.newName;
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }

  static async index (userId){
    return getPlaylistsCollection().find({userId : userId}).toArray();
  }

  static async deletePlaylist (id, userId){
    var _id = new ObjectId(id);
    await getPlaylistsCollection().findOneAndDelete({_id:_id});
    return getPlaylistsCollection().find({userId : userId}).toArray();
  }

  static async show (playlistId) {
    var _id = new ObjectId(playlistId);
    var playlist = await getPlaylistsCollection().findOne({_id : _id});
    if (!playlist) {
      return null;
    }
    return playlist.songs.sort((a, b)=>{
      if (a.order > b.order){
        return 1;
      }else{
        return -1;
      }
    });
  }

  static async deleteFromPlaylist (songIds, playlistId) {
    var _id = new ObjectId(playlistId);
    var playlist = await getPlaylistsCollection().findOne({_id : _id });
    if (!playlist) {
      return null;
    }

    var songIdsArray = [];
    songIds.forEach(songId=>{
      var mongoid = new ObjectId(songId);
      songIdsArray.push(mongoid);
    });
    var songs = await getSongsCollection().find({_id: {$in: songIdsArray}}).toArray();
    songs.forEach(s=>{
      playlist.songs.forEach(song=>{
        if (s.Song === song.Song){
          var index = playlist.songs.indexOf(song);
          playlist.songs.splice(index, 1);
        }
      });
    });
    playlist.songs.sort((a, b)=>{
      if (a.order > b.order){
        return 1;
      } else if (a.order < b.order ) {
        return -1;
      } else {
        return 0;
      }
    });
    var order = 1;
    playlist.songs.forEach(song=>{
      song.order = order;
      order++;
    });
    await getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist);
    return playlist;
  }
}

module.exports = Playlist;