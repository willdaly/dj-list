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

  static findByKey(obj, fn) {
    var Key = obj.Key;
    var genre = obj.genre;
    listCollection.find({Key:Key, genre:{$in: genre}}).toArray((err, list)=>{
      fn(list);
      });
    } //findByKey

  static findByBPM(obj, fn) {
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var genre = obj.genre;
    listCollection.find({BPM:{'$gte': lowBPM, '$lte': highBPM}, genre:{$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  } //findByBPM

  static findByBpmKey (obj, fn){
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var key = obj.Key;
    var genre = obj.genre;
    listCollection.find({BPM:{'$gte': lowBPM, '$lte': highBPM}, Key: key, genre: {$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  }

  static findByArtist (Artist, fn){
    listCollection.find({Artist: Artist}).toArray((err, list)=>{
      fn(list);
    });
  } //findByArtist

  static findByAlbum (Album, fn){
    listCollection.find({Album: Album}).toArray((err, list)=>{
      fn(list);
    });
  } //findByAlbum

  static findBySong (Song, fn){
    listCollection.find({Song: Song}).toArray((err, list)=>{
      fn(list);
    });
  } //findBySong

  static findByGenre (genre, fn){
    listCollection.find({genre: {$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  } //findByGenre

  } //list

module.exports = List;
