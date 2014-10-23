var listItemsCollection = global.nss.db.collection('listItems');
var songCollection = global.nss.db.collection('songs');

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
} //list

module.exports = ListItem;
