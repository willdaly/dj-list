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
    bpm = Math.abs(bpm);
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
        console.log('******index******');
        console.log(index);
        console.log('******old key******');
        console.log(majorKeyArray[index]);
        key = majorKeyArray[index];
        console.log('******major key******');
        console.log(key);
    }else{
      index = parseInt(minorKeyArray.indexOf(oldkey));
      index = index + Number(trans);
      if(11 < index){
        index = index -12;
      }
      if (index < 0){
        index = index + 12;
      }
      console.log('******index******');
      console.log(index);
      console.log('******old key******');
      console.log(majorKeyArray[index]);
      key = minorKeyArray[index];
      console.log('******minor key******');
      console.log(key);
    }
    var genre = obj.genre;
    listCollection.find({BPM: {'$gte': lowBPM, '$lte': highBPM}, Key: key, genre: {$in: genre}}).toArray((err, list)=>{
      console.log('******list******');
      console.log(list);
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
