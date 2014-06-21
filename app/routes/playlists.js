'use strict';

var traceur = require('traceur');
var Playlist = traceur.require(__dirname + '/../models/playlist.js');
var playlistCollection = global.nss.db.collection('playlists');
var listCollection = global.nss.db.collection('lists');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  playlistCollection.find({userId : req.session.userId}).toArray((e, playlist)=>{

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
  var _id = Mongo.ObjectID(req.body.playlistId);
  console.log('**********_id*********');
  console.log(_id);
  var songs = req.body.songs;
  console.log('**********songs*********');
  console.log(songs);
  playlistCollection.findOne({_id:_id}, (err,playlist)=>{
    console.log('**********playlist');
    console.log(playlist);
    // playlist.update(songs);
    songs.forEach(song=>{
      playlist.songs.push(song);
    });
    console.log('**********pushed*********');
    console.log(playlist);
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
      res.render('playlists/show', {songs : songs});
      });
  });
};
