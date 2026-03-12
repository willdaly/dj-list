const ObjectId = require('mongodb').ObjectId;
const db = require(__dirname + '/../lib/db.js');

function getSongCollection() {
  return db.getCollection('songs');
}

class Song {
  static async create(obj){
    const song = new Song();
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
    const keyArray = [];
    keyArray.push(obj.Key);
    const ambig = obj.Key.slice(0, -1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    const genre = obj.genre;
    return getSongCollection().find({Key:{$in: keyArray}, genre:{$in: genre}}).toArray();
  }

  static async findByBPM(obj) {
    const lowBPM = +obj.BPM[0];
    const highBPM = +obj.BPM[1];
    const genre = obj.genre;
    return getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, genre:{$in: genre}}).toArray();
  }

  static async findByBpmKey (obj){
    const lowBPM = +obj.BPM[0];
    const highBPM = +obj.BPM[1];
    const keyArray = [];
    keyArray.push(obj.Key);
    const ambig = obj.Key.slice(0, -1);
    keyArray.push(ambig.toLowerCase());
    keyArray.push(ambig.toUpperCase());
    const genre = obj.genre;
    return getSongCollection().find({BPM:{'$gte': lowBPM, '$lte': highBPM}, Key: {$in: keyArray}, genre: {$in: genre}}).toArray();
  }

  static async transpose (obj){
    const trans = obj.trans;
    let factor = Math.abs(trans) * 0.06;
    factor = factor + 1;
    let bpm;
    if (trans < 0){
      bpm = obj.BPM / factor;
    }else{
      bpm = obj.BPM * factor;
    }
    const lowBPM = Math.floor(bpm);
    const highBPM = Math.ceil(bpm);
    const oldkey = obj.Key;
    const tonality = oldkey.slice(-1);
    const majorKeyArray = ['AbM', 'AM', 'BbM', 'BM', 'CM', 'C#M', 'DM', 'EbM', 'EM', 'FM', 'F#M', 'GM'];
    const minorKeyArray = ['abm', 'am', 'bbm', 'bm', 'cm', 'c#m', 'dm', 'ebm', 'em', 'fm', 'f#m', 'gm'];
    let key;
    let index;
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
    } else {
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
    const genre = obj.genre.split(',');
    const keyArray = [];
    keyArray.push(key);
    const ambig = key.slice(0, -1);
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
      artists = [...new Set(artists)];
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
    const query = (term || '').trim();
    if (!query) {
      return [];
    }

    const tokens = query
      .split(/\s+/)
      .filter((token) => token.length > 0)
      .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (tokens.length === 0) {
      return [];
    }

    const makeFieldConditions = (field) =>
      tokens.map((token) => ({ [field]: { $regex: new RegExp(token, 'i') } }));

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
    const id = new ObjectId(obj.Id);
    const song = await getSongCollection().findOne({_id: id});
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