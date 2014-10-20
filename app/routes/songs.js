'use strict';

var traceur = require('traceur');
var Song = traceur.require(__dirname + '/../models/song.js');

exports.index = (req, res)=>{
  res.render('songs/index', { title: 'dj-List search'});
};

exports.create = (req, res)=>{
  Song.create(req.body, song=>{
    res.send({songs : song});
  });
};

exports.key = (req, res)=>{
  Song.findByKey(req.body, songs=>{
    res.send({songs : songs});
  });
};

exports.bpm = (req, res)=>{
  Song.findByBPM(req.body, songs=>{
    res.send({songs : songs});
  });
};

exports.bpmKey = (req, res)=>{
  Song.findByBpmKey(req.body, songs=>{
    res.send({songs : songs});
  });
};

exports.artistSearch = (req, res)=>{
  Song.findByArtist(req.body.Artist, songs=>{
    res.send({songs: songs});
  });
};

exports.albumSearch = (req, res)=>{
  Song.findByAlbum(req.body.Album, songs=>{
    res.send({songs: songs});
  });
};

exports.songSearch = (req, res)=>{
  Song.findBySong(req.body.Song, songs=>{
    res.send({songs: songs});
  });
};

exports.genreFilter = (req, res)=>{
  Song.findByGenre(req.body.genre, songs=>{
    res.send({songs: songs});
  });
};

exports.transpose = (req, res)=>{
  Song.transpose(req.body, songs=>{
    res.send({songs: songs});
  });
};
