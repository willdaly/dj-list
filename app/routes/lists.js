'use strict';

var traceur = require('traceur');
var List = traceur.require(__dirname + '/../models/list.js');
var playlistCollection = global.nss.db.collection('playlists');

exports.index = (req, res)=>{
  playlistCollection.find({userId : req.session.userId}).toArray((e, playlists)=>{
    if (playlists) {
      res.render('list/index', {playlists : playlists, title: 'dj-List search'});
    } else {
      res.render('list/index', { title: 'dj-List search'});
    }
  });
};

exports.create = (req, res)=>{
  List.create(req.body, song=>{
    res.send({songs : song});
  });
};

exports.key = (req, res)=>{
  List.findByKey(req.body, songs=>{
    res.send({songs : songs});
  });
};

exports.bpm = (req, res)=>{
  List.findByBPM(req.body, songs=>{
    res.send({songs : songs});
  });
};

exports.bpmKey = (req, res)=>{
  List.findByBpmKey(req.body, songs=>{
    res.send({songs : songs});
  });
};

exports.artistSearch = (req, res)=>{
  List.findByArtist(req.body.Artist, songs=>{
    res.send({songs: songs});
  });
};

exports.albumSearch = (req, res)=>{
  List.findByAlbum(req.body.Album, songs=>{
    res.send({songs: songs});
  });
};

exports.songSearch = (req, res)=>{
  List.findBySong(req.body.Song, songs=>{
    res.send({songs: songs});
  });
};

exports.genreFilter = (req, res)=>{
  List.findByGenre(req.body.genre, songs=>{
    res.send({songs: songs});
  });
};

exports.transpose = (req, res)=>{
  List.transpose(req.body, songs=>{
    res.send({songs: songs});
  });
};
