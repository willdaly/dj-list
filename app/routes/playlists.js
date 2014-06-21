'use strict';

var traceur = require('traceur');
var Playlist = traceur.require(__dirname + '/../models/playlist.js');
var playlistCollection = global.nss.db.collection('playlists');
var listCollection = global.nss.db.collection('lists');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  playlistCollection.find({userId : req.session.userId}).toArray((e, playlist)=>{
    console.log('**********playlist');
    res.render('playlists/index', {playlists: playlist, title: 'Playlist index'});
  });
};

exports.create = (req, res)=>{
  Playlist.create(req.body, req.session.userId, playlist=>{
    console.log(playlist);
    res.redirect('/lists');
  });
};

exports.update = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  var songs = req.body.songs;
  playlistCollection.findOne({_id:_id}, (err,playlist)=>{
    playlist.update(songs);
    playlistCollection.save((pl)=>{
      res.render('playlists/show', {songs : songs});
    });

  });
};

exports.show = (req, res) =>{
  var _id = Mongo.ObjectID(req.params.id);
  playlistCollection.findOne({_id:_id}, (err, pl)=>{
    var songsArray = [];
    pl.songs.forEach(id =>{
      songsArray.push(Mongo.ObjectID(id));
    });
    console.log('**********songsArray*********');
    console.log(songsArray);
    listCollection.find({_id :{$in: songsArray}}).toArray((err, songs)=>{
      console.log('**********songs*********');
      console.log(songs);
      res.render('playlists/show', {songs : songs});
      });
  });
};
