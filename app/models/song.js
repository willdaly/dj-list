var songCollection = global.nss.db.collection('songs');

class Song {
  static create(obj, fn){
    var song = new Song();
    song.Artist = obj.Artist;
    song.Album = obj.Album || '';
    song.Song = obj.Title;
    song.BPM = parseInt(obj.BPM);
    song.Key = obj.Key;
    song.genre = obj.genre;
    songCollection.save(song, ()=>fn(song));
  } //create

  static findByKey(obj, fn) {
    var Key = obj.Key;
    var genre = obj.genre;
    songCollection.find({Key:Key, genre:{$in: genre}}).toArray((err, list)=>{
      fn(list);
      });
    } //findByKey

  static findByBPM(obj, fn) {
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var genre = obj.genre;
    songCollection.find({BPM:{'$gte': lowBPM, '$lte': highBPM}, genre:{$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  } //findByBPM

  static findByBpmKey (obj, fn){
    var lowBPM = +obj.BPM[0];
    var highBPM = +obj.BPM[1];
    var key = obj.Key;
    var genre = obj.genre;
    songCollection.find({BPM:{'$gte': lowBPM, '$lte': highBPM}, Key: key, genre: {$in: genre}}).toArray((err, list)=>{
      fn(list);
    });
  }

  static transpose (obj, fn){
    var trans = obj.trans;
    var factor = (trans * 0.06);
    var bpm;
    if (factor < 0){
      factor = factor - 1;
      bpm = obj.BPM / factor;
    }else{
      factor = factor + 1;
      bpm = obj.BPM * factor;
    }
    var lowBPM = Math.floor(bpm);
    var highBPM = Math.ceil(bpm);
    var oldkey = obj.Key;
    var oldkeyLength = oldkey.length;
    var tonality = oldkey.substr(oldkeyLength -1, 1);
    var majorKeyArray = ['AbM', 'AM',' BbM', 'BM', 'CM', 'C#M', 'DM', 'EbM', 'EM', 'FM', 'F#M', 'GM'];
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
    songCollection.find({BPM: {'$gte': lowBPM, '$lte': highBPM}, Key: key, genre: {$in: genre}}).toArray((err, songs)=>{
      fn(songs);
    });
  }

  static findByArtist (Artist, fn){
    songCollection.find({'Artist' : { $regex: new RegExp('^' + Artist.toLowerCase(), 'i')  }}).toArray((err, songs)=>{
      fn(songs);
    });
  } //findByArtist

  static findByAlbum (Album, fn){
    songCollection.find({'Album' : { $regex: new RegExp('^' + Album.toLowerCase(), 'i')  }}).toArray((err, songs)=>{
      fn(songs);
    });
  } //findByAlbum

  static findBySong (title, fn){
    songCollection.find({'Song' : { $regex: new RegExp('^' + title.toLowerCase(), 'i')  }}).toArray((err, song)=>{
      fn(song);
    });
  } //findBySong

  static findByGenre (genre, fn){
    songCollection.find({genre: {$in: genre}}).toArray((err, songs)=>{
      fn(songs);
    });
  } //findByGenre

  } //list

module.exports = Song;
