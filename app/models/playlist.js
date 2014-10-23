var playlistCollection = global.nss.db.collection('playlists');
var listItemsCollection = global.nss.db.collection('listItems');
var traceur = require('traceur');
var ListItem = traceur.require(__dirname + '/../models/listItem.js');
var Mongo = require('mongodb');


class Playlist {
  static create (obj, userId, fn){
    playlistCollection.findOne({name: obj.name}, (e, pl)=>{
      if (!pl){
        var playlist = new Playlist();
        playlist._id = Mongo.ObjectID(obj._id);
        playlist.name = obj.name;
        playlist.userId = userId;
        var order = 1;
        obj.songIds.forEach(sId=>{
          var songId = Mongo.ObjectID(sId);
          ListItem.create(order, songId, playlist._id, listItem=>{
            if (listItem) {
              order++;
            }
          });

        });

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

  static addSongs (playlistId, songs, fn) {
    var _id = Mongo.ObjectID(playlistId);
    playlistCollection.findOne({_id:_id}, (err,playlist)=>{
      songs.forEach(song=>{
        playlist.songs.push(song);
      });
      playlistCollection.save(playlist, songz=>fn(songz));
    });
  } //addSongs

  static show (playlistId, fn) {
    var _id = Mongo.ObjectID(playlistId);
    listItemsCollection.find({playlistId : _id}).sort({ order: 1}).toArray((err, songs)=>{ //save
      fn(songs);
    }); //save
  } //show

} //Playlist


module.exports = Playlist;
