var playlistsCollection = global.nss.db.collection('playlists');
// var listItemsCollection = global.nss.db.collection('listItems');
var songsCollection = global.nss.db.collection('songs');
// var traceur = require('traceur');
// var ListItem = traceur.require(__dirname + '/../models/listItem.js');
var Mongo = require('mongodb');


class Playlist {
  static create (obj, userId, fn){
    var songsArray = [];
    obj.songIds.forEach(song=>{
      var mongoid =  Mongo.ObjectID(song);
      songsArray.push(mongoid);
    });
    songsCollection.find( {_id: {$in: songsArray}}).toArray((err, songs)=>{
      if (songs) {
        var sArray = [];
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
        fn(null);
      }
    });
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

  static addSongs (playlistId, song, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistsCollection.findOne({_id:_id}, (err,playlist)=>{
      var playlistLength = playlist.songs.length;
      song.order = playlistLength++;
      playlist.songs.push(song);
      playlistsCollection.save(playlist, playlist=>fn(playlist));
    });
  } //addSongs

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

  // static updatePlaylist (songId, order, playlistId, fn){
  //   var _id = Mongo.ObjectID(playlistId);
  //   playlistsCollection.findOne({_id : _id }, (err, playlist)=>{
  //     var o = order;
  //     playlist.songs.forEach(song=>{
  //       if (song.order >= o){
  //         song.order = o +1;
  //         o++;
  //       }
  //     }); //updates songs with orders greater or equal to one that moved
  //   playlist.songs.forEach(song=>{
  //     if (song._id.toString() === songId){
  //       song.order = order;
  //     }
  //   }); //updates
  //
  //   });
  // }

  static deleteFromPlaylist (songIds, playlistId, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistsCollection.findOne({_id : _id }, (err, playlist)=>{

      playlist.songs.forEach(song=>{
        songIds.forEach(songId=>{
          if (song._id.toString() === songId){
            var index = playlist.songs.indexOf(song);
            playlist.songs.splice(index, 1);
          }
        }); //deletes songs
        playlist.songs.sort((a, b)=>{
          if (a.order > b.order){
            return -1;
          } else if (a.order < b.order ) {
            return 1;
          } else {
            return 0;
          }
        }); //sorts playlist
      var order = 1;
      playlist.songs.forEach(song=>{
        song.order = order;
        order++;
      }); //reorders playlist
      });
    playlistsCollection.save(playlist, ()=>fn(playlist));
    });
  }

} //Playlist


module.exports = Playlist;
