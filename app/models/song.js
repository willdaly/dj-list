var Mongo = require('mongodb');
var _ = require('lodash');

var getSongCollection = function() {
  if (!global.nss || !global.nss.db) {
    throw new Error('Database not initialized');
  }
  return global.nss.db.collection('songs');
};

class Song {
  static create(obj, fn){
    var song = new Song();
    song.Artist = obj.Artist;
    song.Album = obj.Album || '';
    song.Song = obj.Title;
    song.BPM = parseInt(obj.BPM);
    song.Key = obj.Key;
    song.genre = obj.genre;
    getSongCollection().insertOne(song, ()=>fn(song));
  }

  static findByKey(obj, fn) {
    var keyArray = [];
    keyArray.push(obj.Key);
    var ambig = obj.Key.substr(0, obj.Key.length-1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    var genre = obj.genre;
    getSongCollection().find({Key:{$in: keyArray}, genre:{$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  }

  static findByBPM(obj, fn) {
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var genre = obj.genre;
    getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, genre:{$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  }

  static findByBpmKey (obj, fn){
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var keyArray = [];
    keyArray.push(obj.Key);
    var ambig = obj.Key.substr(0, obj.Key.length-1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    var genre = obj.genre;
    getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, Key: {$in: keyArray}, genre: {$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  }

  static transpose (obj, fn){
    var trans = obj.trans;
    var factor = Math.abs(trans) * 0.06;
    factor = factor + 1;
    var bpm;
    if (trans < 0){
      bpm = obj.BPM / factor;
    }else{
      bpm = obj.BPM * factor;
    }
    var lowBPM = Math.floor(bpm);
    var highBPM = Math.ceil(bpm);
    var oldkey = obj.Key;
    var tonality = oldkey.substr(oldkey.length-1, 1);
    var majorKeyArray = ['AbM', 'AM', 'BbM', 'BM', 'CM', 'C#M', 'DM', 'EbM', 'EM', 'FM', 'F#M', 'GM'];
    var minorKeyArray = ['abm', 'am', 'bbm', 'bm', 'cm', 'c#m', 'dm', 'ebm', 'em', 'fm', 'f#m', 'gm'];
    var key;
    var index;
    if (tonality === 'M'){
        index = parseInt(majorKeyArray.indexOf(oldkey));
        index = index + Number(trans);
        if(11 < index){
          index = index -12;
        }
        if (index < 0){
          index = index + 12;
        }
        key = majorKeyArray[index];
    }else{
      index = parseInt(minorKeyArray.indexOf(oldkey));
      index = index + Number(trans);
      if(11 < index){
        index = index -12;
      }
      if (index < 0){
        index = index + 12;
      }
      key = minorKeyArray[index];
    }
    var genre = obj.genre.split(',');
    var keyArray = [];
    keyArray.push(key);
    var ambig = key.substr(0, key.length-1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    getSongCollection().find({BPM: {'$gte': lowBPM, '$lte': highBPM}, Key: {$in: keyArray}, genre: {$in: genre}}).toArray((err, songs)=>{
      fn(songs);
    });
  }

static guessSearch (typed, fn){
  getSongCollection().find({$text: {$search: typed}}).toArray((err, songs)=>{
    var artists = [];
    if (songs) {  // Check if songs exists
      songs.forEach(song=>{
        artists.push(song.Artist);
      });
      artists = _.uniq(artists);
    }
    fn(artists);
  });
}

  static findByArtist (Artist, fn){
    getSongCollection().find({'Artist' : { $regex: new RegExp('^' + Artist.toLowerCase(), 'i')  }}).toArray((err, songs)=>{
      fn(songs);
    });
  }

  static findByAlbum (Album, fn){
    getSongCollection().find({'Album' : { $regex: new RegExp('^' + Album.toLowerCase(), 'i')  }}).toArray((err, songs)=>{
      fn(songs);
    });
  }

  static findBySong (title, fn){
    getSongCollection().find({'Song' : { $regex: new RegExp('^' + title.toLowerCase(), 'i')  }}).toArray((err, song)=>{
      fn(song);
    });
  }

  static findByGenre (genre, fn){
    getSongCollection().find({genre: {$in: genre}}).toArray((err, songs)=>{
      fn(songs);
    });
  }

  static editSong (obj, fn){
    var id = new Mongo.ObjectId(obj.Id);
    getSongCollection().findOne({_id: id}, (e, song)=>{
      if (obj.Artist) {
        song.Artist = obj.Artist;
        console.log(song.Artist);
      }
      if (obj.Album) {
        song.Album = obj.Album;
        console.log(song.Album);
      }
      if (obj.Title) {
        song.Song = obj.Title;
        console.log(song.Song);
      }
      if (obj.BPM) {
        song.BPM = parseInt(obj.BPM);
        console.log(song.BPM);
      }
      if (obj.Key) {
        song.Key = obj.Key;
        console.log(song.Key);
      }
      if (obj.genre) {
        song.genre = obj.genre;
        console.log(song.genre);
      }
      getSongCollection().replaceOne({_id: song._id}, song, ()=>fn(song));
    });
  }
}

module.exports = Song;