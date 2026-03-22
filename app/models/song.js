const path = require('path');
const ObjectId = require('mongodb').ObjectId;
const db = require(path.join(__dirname, '..', 'lib', 'db.js'));
const { searchPreviewUrl } = require(path.join(__dirname, '..', 'lib', 'spotify-preview.js'));

function getSongCollection() {
  return db.getCollection('songs');
}

function buildKeyVariants(key) {
  const ambig = key.slice(0, -1);
  return [key, ambig.toLowerCase(), ambig.toUpperCase()];
}

class Song {
  static async create(obj) {
    const song = {};
    song.Artist = obj.Artist;
    song.Album = obj.Album || '';
    song.Song = obj.Title;
    song.BPM = parseInt(obj.BPM);
    song.Key = obj.Key;
    song.genre = obj.genre;
    const result = await getSongCollection().insertOne(song);
    song._id = result.insertedId;

    const previewUrl = await searchPreviewUrl(obj.Artist, obj.Title);
    if (previewUrl) {
      await getSongCollection().updateOne({ _id: song._id }, { $set: { previewUrl } });
      song.previewUrl = previewUrl;
    }

    return song;
  }

  static async findByKey(obj) {
    const keyArray = buildKeyVariants(obj.Key);
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
    const keyArray = buildKeyVariants(obj.Key);
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
    const keyArray = buildKeyVariants(key);
    return getSongCollection().find({BPM: {'$gte': lowBPM, '$lte': highBPM}, Key: {$in: keyArray}, genre: {$in: genre}}).toArray();
  }

  static async guessSearch (typed){
    const songs = await getSongCollection().find({$text: {$search: typed}}).toArray();
    let artists = [];
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

  static async editSong(obj) {
    const id = new ObjectId(obj.Id);
    const song = await getSongCollection().findOne({ _id: id });
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
    await getSongCollection().replaceOne({ _id: song._id }, song);
    return song;
  }

  static async updatePreview(songId) {
    const id = new ObjectId(songId);
    const song = await getSongCollection().findOne({ _id: id });
    if (!song) {
      return null;
    }
    const previewUrl = await searchPreviewUrl(song.Artist, song.Song);
    await getSongCollection().updateOne({ _id: id }, { $set: { previewUrl: previewUrl || null } });
    const updated = await getSongCollection().findOne({ _id: id });
    return updated;
  }

  static async findHarmonicMatches(songId) {
    const id = new ObjectId(songId);
    const song = await getSongCollection().findOne({ _id: id });
    if (!song) {
      return null;
    }
    const codes = song.harmonicCodes;
    if (!codes || codes.length === 0) {
      return [];
    }
    const bpm = song.BPM || 0;
    const lowBPM = Math.floor(bpm * 0.94);
    const highBPM = Math.ceil(bpm * 1.06);
    return getSongCollection()
      .find({
        _id: { $ne: id },
        camelotCode: { $in: codes },
        BPM: { $gte: lowBPM, $lte: highBPM },
      })
      .toArray();
  }

  static async findSimilar(songId) {
    const id = new ObjectId(songId);
    const song = await getSongCollection().findOne({ _id: id });
    if (!song) {
      return null;
    }
    const ids = song.similarSongIds;
    if (!ids || ids.length === 0) {
      return [];
    }
    const objectIds = ids.map((sid) => new ObjectId(sid));
    return getSongCollection().find({ _id: { $in: objectIds } }).toArray();
  }

  static async findNextTracks(songId) {
    const id = new ObjectId(songId);
    const song = await getSongCollection().findOne({ _id: id });
    if (!song) {
      return null;
    }
    const codes = song.harmonicCodes;
    if (!codes || codes.length === 0) {
      return [];
    }
    const bpm = song.BPM || 0;
    const lowBPM = Math.floor(bpm * 0.92);
    const highBPM = Math.ceil(bpm * 1.08);
    const energy = song.energyTier || '';
    const energyOptions = [energy];
    if (energy === 'high_energy') energyOptions.push('mid_energy');
    if (energy === 'mid_energy') energyOptions.push('high_energy', 'low_energy');
    if (energy === 'low_energy') energyOptions.push('mid_energy');
    const query = {
      _id: { $ne: id },
      camelotCode: { $in: codes },
      BPM: { $gte: lowBPM, $lte: highBPM },
    };
    if (energy) {
      query.energyTier = { $in: energyOptions };
    }
    return getSongCollection().find(query).limit(10).toArray();
  }
}

module.exports = Song;