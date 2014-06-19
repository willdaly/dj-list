'use strict';

// var lists = global.nss.db.collection('lists');
var traceur = require('traceur');
var List = traceur.require(__dirname + '/../models/list.js');

exports.index = (req, res)=>{
  // lists.find().toArray((err, list)=>{
  // list: list,
    res.render('list/index', { title: 'dj-List search'});
  // });
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
