var playlistsCollection = global.nss.db.collection('playlists');
// var listItemsCollection = global.nss.db.collection('listItems');
var songsCollection = global.nss.db.collection('songs');
// var traceur = require('traceur');
// var ListItem = traceur.require(__dirname + '/../models/listItem.js');
var Mongo = require('mongodb');
// var _ = require('lodash');


class Playlist {
  static create (obj, userId, fn){
    var songsArray = [];
    var sArray = [];
    if (obj.songIds) {
      obj.songIds.forEach(song=>{
        var mongoid =  Mongo.ObjectID(song);
        songsArray.push(mongoid);
      });
    }

    songsCollection.find( {_id: {$in: songsArray}}).toArray((err, songs)=>{
      if (songs) {
        var order = 1;
        songs.forEach(song=>{
          song.order = order;
          order++;
          sArray.push(song);
        });
        playlistsCollection.findOne({name: obj.name}, (e, playlist)=>{
            if (!playlist){
              playlist = new Playlist();
              playlist._id = Mongo.ObjectID(obj._id);
              playlist.name = obj.name;
              playlist.userId = userId;
              playlist.songs = sArray;
              playlistsCollection.save(playlist, ()=>fn(playlist));
            }else{
              fn(null);
            }
          }); //playlist find
      } else {
        playlistsCollection.findOne({name: obj.name}, (e, playlist)=>{
            if (!playlist){
              playlist = new Playlist();
              playlist._id = Mongo.ObjectID(obj._id);
              playlist.name = obj.name;
              playlist.userId = userId;
              playlist.songs = sArray;
              playlistsCollection.save(playlist, ()=>fn(playlist));
            }else{
              fn(null);
            }
          }); //playlist find
        fn(null);
      }
    }); //songsfind
  }

  static addSongs (obj, fn) {
    var _id = Mongo.ObjectID(obj.playlistId);
    playlistsCollection.findOne({_id:_id}, (err,playlist)=>{
      var songsArray = [];
      obj.songIds.forEach(song=>{
        var mongoid =  Mongo.ObjectID(song);
        songsArray.push(mongoid);
      });
      songsCollection.find( {_id: {$in: songsArray}}).toArray((err, songs)=>{
        if (songs) {
          var playlistLength = playlist.songs.length > 0 ? playlist.songs.length : 1;
          songs.forEach(song=>{
            song.order = playlistLength++;
            playlist.songs.push(song);
          });
          playlistsCollection.save(playlist, playlist=>fn(playlist));
        } else {
          fn(null);
        }
      });
    }); //findplaylist
  }

  static rename (obj, fn) {
    console.log('hit model');
    var _id = Mongo.ObjectID(obj.playlistId);
    playlistsCollection.findOne({_id:_id}, (err,playlist)=>{
      if (playlist){
        console.log(playlist.name);
        playlist.name = obj.newName;
        playlistsCollection.save(playlist, p=>fn(p));
      } else {
        fn(null);
      }
    }); //findplaylist
  }


  static index (userId, fn){
    playlistsCollection.find({userId : userId}).toArray((e, playlists)=>{
      if (playlists) {
        fn(playlists);
      } else {
        fn(null);
      }
    });
  } //index

  static deletePlaylist (id, userId, fn){
    var _id = Mongo.ObjectID(id);
    playlistsCollection.findAndRemove({_id:_id}, ()=>{
      playlistsCollection.find({userId : userId}).toArray((e, playlists)=>{
        if (playlists) {
          fn(playlists);
        } else {
          fn(null);
        }
      });
    });
  } // deletePlaylist

  static show (playlistId, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistsCollection.findOne({_id : _id}, (err, playlist)=>{
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
  } //show

  static deleteFromPlaylist (songIds, playlistId, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistsCollection.findOne({_id : _id }, (err, playlist)=>{
      var songIdsArray = [];
      songIds.forEach(songId=>{
        var mongoid = Mongo.ObjectID(songId);
        songIdsArray.push(mongoid);
      });
      songsCollection.find({_id: {$in: songIdsArray}}).toArray((err, songs)=>{
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
        }); //sorts playlist
        var order = 1;
        playlist.songs.forEach(song=>{
          song.order = order;
          order++;
        }); //reorders playlist
        playlistsCollection.save(playlist, ()=>fn(playlist));
      }); //songcollection
    }); //find playlist
  } //Playlist

}

module.exports = Playlist;
