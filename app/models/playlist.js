var Mongo = require('mongodb');

var getPlaylistsCollection = function() {
  if (!global.nss || !global.nss.db) {
    throw new Error('Database not initialized');
  }
  return global.nss.db.collection('playlists');
};

var getSongsCollection = function() {
  if (!global.nss || !global.nss.db) {
    throw new Error('Database not initialized');
  }
  return global.nss.db.collection('songs');
};

class Playlist {
  static create (obj, userId, fn){
    var songsArray = [];
    var sArray = [];
    if (obj.songIds) {
      obj.songIds.forEach(song=>{
        var mongoid =  new Mongo.ObjectId(song);
        songsArray.push(mongoid);
      });
    }

    getSongsCollection().find( {_id: {$in: songsArray}}).toArray((err, songs)=>{
      if (songs) {
        var order = 1;
        songs.forEach(song=>{
          song.order = order;
          order++;
          sArray.push(song);
        });
        getPlaylistsCollection().findOne({name: obj.name}, (e, playlist)=>{
            if (!playlist){
              playlist = new Playlist();
              playlist._id = new Mongo.ObjectId(obj._id);
              playlist.name = obj.name;
              playlist.userId = userId;
              playlist.songs = sArray;
              getPlaylistsCollection().insertOne(playlist, ()=>fn(playlist));
            }else{
              fn(null);
            }
          });
      } else {
        getPlaylistsCollection().findOne({name: obj.name}, (e, playlist)=>{
            if (!playlist){
              playlist = new Playlist();
              playlist._id = new Mongo.ObjectId(obj._id);
              playlist.name = obj.name;
              playlist.userId = userId;
              playlist.songs = sArray;
              getPlaylistsCollection().insertOne(playlist, ()=>fn(playlist));
            }else{
              fn(null);
            }
          });
        fn(null);
      }
    });
  }

  static addSongs (obj, fn) {
    var _id = new Mongo.ObjectId(obj.playlistId);
    getPlaylistsCollection().findOne({_id:_id}, (err,playlist)=>{
      var songsArray = [];
      obj.songIds.forEach(song=>{
        var mongoid =  new Mongo.ObjectId(song);
        songsArray.push(mongoid);
      });
      getSongsCollection().find( {_id: {$in: songsArray}}).toArray((err, songs)=>{
        if (songs) {
          var order = playlist.songs.length > 0 ? playlist.songs.length + 1 : 1;
          songs.forEach(song=>{
            song.order = order;
            playlist.songs.push(song);
            order++;
          });
          getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist, ()=>fn(playlist));
        } else {
          fn(null);
        }
      });
    });
  }

  static updateOrder (obj, playlistId, fn) {
    var _id = new Mongo.ObjectId(playlistId);
    var oldOrder = parseInt(obj.oldOrder);
    var newOrder = parseInt(obj.newOrder);
    getPlaylistsCollection().findOne({_id : _id}, (err, playlist)=>{
      if (playlist) {
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
        getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist, ()=>fn(playlist));
      } else {
        fn(null);
      }
    });
  }

  static rename (obj, fn) {
    console.log('hit model');
    var _id = new Mongo.ObjectId(obj.playlistId);
    getPlaylistsCollection().findOne({_id:_id}, (err,playlist)=>{
      if (playlist){
        console.log(playlist.name);
        playlist.name = obj.newName;
        getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist, ()=>fn(playlist));
      } else {
        fn(null);
      }
    });
  }

  static index (userId, fn){
    getPlaylistsCollection().find({userId : userId}).toArray((e, playlists)=>{
      if (playlists) {
        fn(playlists);
      } else {
        fn(null);
      }
    });
  }

  static deletePlaylist (id, userId, fn){
    var _id = new Mongo.ObjectId(id);
    getPlaylistsCollection().findOneAndDelete({_id:_id}, ()=>{
      getPlaylistsCollection().find({userId : userId}).toArray((e, playlists)=>{
        if (playlists) {
          fn(playlists);
        } else {
          fn(null);
        }
      });
    });
  }

  static show (playlistId, fn) {
    var _id = new Mongo.ObjectId(playlistId);
    getPlaylistsCollection().findOne({_id : _id}, (err, playlist)=>{
      if (playlist) {
        var songs = playlist.songs.sort((a, b)=>{
          if (a.order > b.order){
            return 1;
          }else{
            return -1;
          }
        });
        fn(songs);
      } else {
        fn(null);
      }
    });
  }

  static deleteFromPlaylist (songIds, playlistId, fn) {
    var _id = new Mongo.ObjectId(playlistId);
    getPlaylistsCollection().findOne({_id : _id }, (err, playlist)=>{
      var songIdsArray = [];
      songIds.forEach(songId=>{
        var mongoid = new Mongo.ObjectId(songId);
        songIdsArray.push(mongoid);
      });
      getSongsCollection().find({_id: {$in: songIdsArray}}).toArray((err, songs)=>{
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
        getPlaylistsCollection().replaceOne({_id: playlist._id}, playlist, ()=>fn(playlist));
      });
    });
  }
}

module.exports = Playlist;