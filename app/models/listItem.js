var listItemsCollection = global.nss.db.collection('listItems');
var songCollection = global.nss.db.collection('songs');
var Mongo = require('mongodb');

class ListItem {
  static create(order, songId, playlistId, fn){
    listItemsCollection.findOne({playlistId : playlistId, order : order}, (e, listItem)=>{
      if (!listItem){
        songCollection.findOne({_id : songId}, (err, song)=>{
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
          listItemsCollection.save(li, li=>{
            fn(li);
          });
        });
      } else {
        fn(null);
      }
    });
  } //create

  static destroyListItem (playlistId, songIds, fn) {
    songIds.map((id)=>{ return Mongo.ObjectID(id);  });
    console.log('songIds');
    console.log(songIds);
    listItemsCollection.findAndRemove({songId : { $in: songIds }}, listItems=>{
      fn(listItems);
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
