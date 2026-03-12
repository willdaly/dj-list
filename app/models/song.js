var Mongo = require('mongodb');
var _ = require('lodash');
var db = require(__dirname + '/../lib/db.js');

var getSongCollection = function() {
  return db.getCollection('songs');
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
    getSongCollection().insertOne(song, (err)=>fn(err, song));
  }

  static findByKey(obj, fn) {
    var keyArray = [];
    keyArray.push(obj.Key);
    var ambig = obj.Key.substr(0, obj.Key.length-1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    var genre = obj.genre;
    getSongCollection().find({Key:{$in: keyArray}, genre:{$in: genre}}).toArray((err, list)=>{
      fn(err, list);
    });
  }

  static findByBPM(obj, fn) {
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var genre = obj.genre;
    getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, genre:{$in: genre}}).toArray((err, list)=>{
      fn(err, list);
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
      fn(err, list);
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
      fn(err, songs);
    });
  }

  static guessSearch (typed, fn){
    getSongCollection().find({$text: {$search: typed}}).toArray((err, songs)=>{
      if (err) {
        return fn(err);
      }
      var artists = [];
      if (songs) {
        songs.forEach(song=>{
          artists.push(song.Artist);
        });
        artists = _.uniq(artists);
      }
      fn(null, artists);
    });
  }

  static findByArtist (Artist, fn){
    getSongCollection().find({'Artist' : { $regex: new RegExp('^' + Artist.toLowerCase(), 'i')  }}).toArray((err, songs)=>{
      fn(err, songs);
    });
  }

  static findByAlbum (Album, fn){
    getSongCollection().find({'Album' : { $regex: new RegExp('^' + Album.toLowerCase(), 'i')  }}).toArray((err, songs)=>{
      fn(err, songs);
    });
  }

  static findBySong (title, fn){
    getSongCollection().find({'Song' : { $regex: new RegExp('^' + title.toLowerCase(), 'i')  }}).toArray((err, song)=>{
      fn(err, song);
    });
  }

  static findByGenre (genre, fn){
    getSongCollection().find({genre: {$in: genre}}).toArray((err, songs)=>{
      fn(err, songs);
    });
  }

  static editSong (obj, fn){
    var id = new Mongo.ObjectId(obj.Id);
    getSongCollection().findOne({_id: id}, (e, song)=>{
      if (e) {
        return fn(e);
      }
      if (!song) {
        return fn(null, null);
      }
      if (obj.Artist) {
        song.Artist = obj.Artist;
      }
      if (obj.Album) {
        song.Album = obj.Album;
      }
      if (obj.Title) {
        song.Song = obj.Title;
      }
      if (obj.BPM) {
        song.BPM = parseInt(obj.BPM);
      }
      if (obj.Key) {
        song.Key = obj.Key;
      }
      if (obj.genre) {
        song.genre = obj.genre;
      }
      getSongCollection().replaceOne({_id: song._id}, song, (err)=>fn(err, song));
    });
  }
}

module.exports = Song;