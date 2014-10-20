'use strict';

var traceur = require('traceur');
var Playlist = traceur.require(__dirname + '/../models/playlist.js');
var playlistCollection = global.nss.db.collection('playlists');
var listCollection = global.nss.db.collection('lists');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  playlistCollection.find({userId : req.session.userId}).toArray((e, playlist)=>{
    res.send({playlists : playlist});
  });
};

exports.create = (req, res)=>{
  Playlist.create(req.body, req.session.userId, playlist=>{
    console.log(playlist);
    res.redirect('/lists');
  });
};

exports.delete = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  playlistCollection.findAndRemove({_id:_id}, (err, pl)=>{
    playlistCollection.find({userId : req.session.userId}).toArray((e, playlist)=>{
      res.render('playlists/index', {playlists: playlist, title: 'Playlist index'});
    });
  });
};

exports.removeSong = (req, res)=>{
  var _id = Mongo.ObjectID(req.body.playlistId);
  var songs = req.body.songs;
  playlistCollection.findOne({_id:_id}, (err,playlist)=>{
    songs.forEach(song=>{
      var index = playlist.songs.indexOf(song);
      playlist.songs.splice(index, 1);
      });
    playlistCollection.save(playlist, ()=>{
      listCollection.find({_id : {$in: playlist.songs}}).toArray((err, sngs)=>{
        res.render('playlists/show', {songs : songs, playlist : playlist});
      });
    });
    });
};

exports.update = (req, res)=>{
  var _id = Mongo.ObjectID(req.body.playlistId);
  var songs = req.body.songs;
  playlistCollection.findOne({_id:_id}, (err,playlist)=>{
    songs.forEach(song=>{
      playlist.songs.push(song);
    });
    playlistCollection.save(playlist, ()=>res.render('list/index'));
    });
};

exports.show = (req, res) =>{
  var _id = Mongo.ObjectID(req.params.id);
  playlistCollection.findOne({_id:_id}, (err, pl)=>{
    var songsArray = [];
    pl.songs.forEach(id =>{
      songsArray.push(Mongo.ObjectID(id));
    });
    listCollection.find({_id :{$in: songsArray}}).toArray((err, songs)=>{
      res.send({songs : songs, playlist : pl});
      });
  });
};
