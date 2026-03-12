var ObjectId = require('mongodb').ObjectId;
var db = require(__dirname + '/../lib/db.js');

function getListItemsCollection() {
  return db.getCollection('listItems');
}

function getSongCollection() {
  return db.getCollection('songs');
}

class ListItem {
  static async create(order, songId, playlistId){
    var listItem = await getListItemsCollection().findOne({playlistId : playlistId, order : order});
    if (listItem) {
      return null;
    }

    var songObjectId = new ObjectId(songId);
    var song = await getSongCollection().findOne({_id : songObjectId});
    if (!song) {
      return null;
    }

    var li = new ListItem();
    li.order = order;
    li.songId = songObjectId;
    li.playlistId = playlistId;
    li.artist = song.Artist;
    li.album = song.Album;
    li.title = song.Song;
    li.bpm = song.BPM;
    li.key = song.Key;
    li.genre = song.genre;

    await getListItemsCollection().insertOne(li);
    return li;
  } //create

  static async destroyListItem (playlistId, songIds) {
    var ids = songIds.map((id)=>new ObjectId(id));
    var result = await getListItemsCollection().deleteMany({songId : { $in: ids }});
    return {deletedCount: result ? result.deletedCount : 0};
  }//removeSong

} //list

module.exports = ListItem;
