var playlistCollection = global.nss.db.collection('playlists');
var songCollection = global.nss.db.collection('lists');
var Mongo = require('mongodb');


class Playlist {
  static create (obj, userId, fn){
    playlistCollection.findOne({name: obj.name}, (e, pl)=>{
      if (!pl){
        var playlist = new Playlist();
        playlist._id = Mongo.ObjectID(obj._id);
        playlist.name = obj.name;
        playlist.songs = obj.songs;
        playlist.userId = userId;
        playlistCollection.save(playlist, ()=>fn(playlist));
      }else{
        fn(null);
      }
    }); //playlist find
  } //create

  static index (userId, fn){
    playlistCollection.find({userId : userId}).toArray((e, playlists)=>{
      if (playlists) {
        fn(playlists);
      } else {
        fn(null);
      }
    });
  } //index

  static deletePlaylist (id, userId, fn){
    var _id = Mongo.ObjectID(id);
    playlistCollection.findAndRemove({_id:_id}, ()=>{
      playlistCollection.find({userId : userId}).toArray((e, playlists)=>{
        if (playlists) {
          fn(playlists);
        } else {
          fn(null);
        }
      });
    });
  } // deletePlaylist

  static removeSong (playlistId, songs, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistCollection.findOne({_id:_id}, (err,playlist)=>{
      songs.forEach(song=>{
        var index = playlist.songs.indexOf(song);
        playlist.songs.splice(index, 1);
        });
      playlistCollection.save(playlist, ()=>{
        songCollection.find({_id : {$in: playlist.songs}}).toArray((err, songz)=>{
          fn(songz);
        });
      });
    });
  }//removeSong

  static addSongs (playlistId, songs, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistCollection.findOne({_id:_id}, (err,playlist)=>{
      songs.forEach(song=>{
        playlist.songs.push(song);
      });
      playlistCollection.save(playlist, songz=>fn(songz));
    });
  } //addSongs

  static show (id, fn) {
    var _id = Mongo.ObjectID(id);
    playlistCollection.findOne({_id:_id}, (err, playlist)=>{
      if (playlist.songs.length > 0){
        var songsArray = []; //if
        playlist.songs.forEach(songId =>{
          songsArray.push(Mongo.ObjectID(songId));
        });
        songCollection.find({_id :{$in: songsArray}}).toArray((err, songs)=>{
          fn(songs, playlist);
        }); //if
      }else{
        fn(null, playlist);
      }
    }); //playlist find one
  }

} //Playlist


module.exports = Playlist;
