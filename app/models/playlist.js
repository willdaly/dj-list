var playlistCollection = global.nss.db.collection('playlists');
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

} //Playlist


module.exports = Playlist;
