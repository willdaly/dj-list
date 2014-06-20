var playlistCollection = global.nss.db.collection('playlists');
// var userCollection = global.nss.db.collection('users');
var Mongo = require('mongodb');
// var _ = require('lodash');

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
        // update user
        // var id = Mongo.ObjectID(userId);
        // userCollection.findOne({_id:id}, (e, u)=>{
        //   u = _.create()
        //   u.playlists.push(playlist);
        //   userCollection.save(u);
        // });
      }else{
        fn(null);
      }
    }); //playlist find
  } //create

} //Playlist


module.exports = Playlist;
