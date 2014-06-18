var listCollection = global.nss.db.collection('lists');


class List {
  static create(obj, fn){
    var list = new List();
    list.artist = obj.Artist;
    list.song = obj.Song;
    list.bpm = obj.BPM;
    list.key = obj.Key;
    list.transpose = '';
    fn(list);
  } //create

  static findByKey(Key, fn) {
    listCollection.find({Key:Key}).toArray((err, list)=>{
      fn(list);
      });
    } //findByKey

  static findByBPM(BPM, fn) {
    var lowBPM = +BPM[0];
    var highBPM = +BPM[1];
    listCollection.find({BPM:{'$gte': lowBPM, '$lte': highBPM}}).toArray((err, list)=>{
      fn(list);
    });
  } //findByBPM

  static findByBpmKey (obj, fn){
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var key = obj.Key;
    listCollection.find({BPM:{'$gte': lowBPM, '$lte': highBPM}, Key: key}).toArray((err, list)=>{
      fn(list);
    });
  }

  static findByArtist (Artist, fn){
    listCollection.find({Artist: Artist}).toArray((err, list)=>{
      fn(list);
    });
  } //findByArtist

  static findBySong (Song, fn){
    listCollection.find({Song: Song}).toArray((err, list)=>{
      fn(list);
    });
  } //findBySong

  } //list

module.exports = List;
