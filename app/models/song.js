var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var db = require(__dirname + '/../lib/db.js');

var getSongCollection = function() {
  return db.getCollection('songs');
};

class Song {
  static async create(obj){
    var song = new Song();
    song.Artist = obj.Artist;
    song.Album = obj.Album || '';
    song.Song = obj.Title;
    song.BPM = parseInt(obj.BPM);
    song.Key = obj.Key;
    song.genre = obj.genre;
    await getSongCollection().insertOne(song);
    return song;
  }

  static async findByKey(obj) {
    var keyArray = [];
    keyArray.push(obj.Key);
    var ambig = obj.Key.substr(0, obj.Key.length-1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    var genre = obj.genre;
    return getSongCollection().find({Key:{$in: keyArray}, genre:{$in: genre}}).toArray();
  }

  static async findByBPM(obj) {
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var genre = obj.genre;
    return getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, genre:{$in: genre}}).toArray();
  }

  static async findByBpmKey (obj){
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var keyArray = [];
    keyArray.push(obj.Key);
    var ambig = obj.Key.substr(0, obj.Key.length-1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    var genre = obj.genre;
    return getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, Key: {$in: keyArray}, genre: {$in: genre}}).toArray();
  }

  static async transpose (obj){
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
    return getSongCollection().find({BPM: {'$gte': lowBPM, '$lte': highBPM}, Key: {$in: keyArray}, genre: {$in: genre}}).toArray();
  }

  static async guessSearch (typed){
    var songs = await getSongCollection().find({$text: {$search: typed}}).toArray();
    var artists = [];
    if (songs) {
      songs.forEach(song=>{
        artists.push(song.Artist);
      });
      artists = _.uniq(artists);
    }
    return artists;
  }

  static async findByArtist (Artist){
    return getSongCollection().find({'Artist' : { $regex: new RegExp('^' + Artist.toLowerCase(), 'i')  }}).toArray();
  }

  static async findByAlbum (Album){
    return getSongCollection().find({'Album' : { $regex: new RegExp('^' + Album.toLowerCase(), 'i')  }}).toArray();
  }

  static async findBySong (title){
    return getSongCollection().find({'Song' : { $regex: new RegExp('^' + title.toLowerCase(), 'i')  }}).toArray();
  }

  static async findBySearchTerm(term){
    var query = (term || '').trim();
    if (!query) {
      return [];
    }

    var tokens = query.split(/\s+/).filter(function(token) {
      return token.length > 0;
    }).map(function(token) {
      return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });

    if (tokens.length === 0) {
      return [];
    }

    var makeFieldConditions = function(field) {
      return tokens.map(function(token) {
        return {[field]: {$regex: new RegExp(token, 'i')}};
      });
    };

    return getSongCollection().find({
      $or: [
        {$and: makeFieldConditions('Artist')},
        {$and: makeFieldConditions('Album')},
        {$and: makeFieldConditions('Song')}
      ]
    }).toArray();
  }

  static async findByGenre (genre){
    return getSongCollection().find({genre: {$in: genre}}).toArray();
  }

  static async editSong (obj){
    var id = new ObjectId(obj.Id);
    var song = await getSongCollection().findOne({_id: id});
    if (!song) {
      return null;
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
    await getSongCollection().replaceOne({_id: song._id}, song);
    return song;
  }
}

module.exports = Song;