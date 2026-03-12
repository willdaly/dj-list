var Mongo = require('mongodb');
var db = require(__dirname + '/../lib/db.js');

function getListItemsCollection() {
  return db.getCollection('listItems');
}

function getSongCollection() {
  return db.getCollection('songs');
}

class ListItem {
  static create(order, songId, playlistId, fn){
    getListItemsCollection().findOne({playlistId : playlistId, order : order}, (e, listItem)=>{
      if (e) {
        return fn(e);
      }
      if (!listItem){
        getSongCollection().findOne({_id : songId}, (err, song)=>{
          if (err) {
            return fn(err);
          }
          if (!song) {
            return fn(null, null);
          }
          var li = new ListItem();
          li.order = order;
          li.songId = songId;
          li.playlistId = playlistId;
          li.artist = song.Artist;
          li.album = song.Album;
          li.title = song.Song;
          li.bpm = song.BPM;
          li.key = song.Key;
          li.genre = song.genre;
          getListItemsCollection().insertOne(li, (insertErr)=>{
            fn(insertErr, li);
          });
        });
      } else {
        fn(null, null);
      }
    });
  } //create

  static destroyListItem (playlistId, songIds, fn) {
    songIds = songIds.map((id)=>new Mongo.ObjectId(id));
    console.log('songIds');
    console.log(songIds);
    getListItemsCollection().deleteMany({songId : { $in: songIds }}, (err, result)=>{
      fn(err, {deletedCount: result ? result.deletedCount : 0});
    });

    // playlistCollection.findOne({_id:_id}, (err,playlist)=>{
    //   songs.forEach(song=>{
    //     var index = playlist.songs.indexOf(song);
    //     playlist.songs.splice(index, 1);
    //     });
    //   playlistCollection.save(playlist, ()=>{
    //     listItemsCollection.find({_id : {$in: playlist.songs}}).toArray((err, songz)=>{
    //       fn(songz);
    //     });
    //   });
    // });
  }//removeSong

} //list

module.exports = ListItem;
