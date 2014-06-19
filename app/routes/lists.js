'use strict';

var lists = global.nss.db.collection('lists');
var traceur = require('traceur');
var List = traceur.require(__dirname + '/../models/list.js');

exports.index = (req, res)=>{
  lists.find().toArray((err, list)=>{
    // console.log(list);
    res.render('list/index', {list: list, title: 'hiphop List'});
  });
};

exports.key = (req, res)=>{
  List.findByKey(req.body.Key, songs=>{
    res.send({songs : songs});
  });
};

exports.bpm = (req, res)=>{
  List.findByBPM(req.body.BPM, songs=>{
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
