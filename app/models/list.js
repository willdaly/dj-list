var listCollection = global.nss.db.collection('lists');


class List {
  static create(obj, fn){
    var list = new List();
    list.artist = obj.Artist;
    list.song = obj.Song;
    list.bpm = obj.BPM;
    list.key = obj.Key;
    fn(list);
  } //create

  static findByKey(Key, fn) {
    listCollection.find({Key:Key}).toArray((err, list)=>{
      fn(list);
      });
    }
  } //list

module.exports = List;
