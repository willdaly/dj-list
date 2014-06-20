'use strict';

var traceur = require('traceur');
var Playlist = traceur.require(__dirname + '/../models/playlist.js');
var playlistCollection = global.nss.db.collection('playlists');
// var listCollection = global.nss.db.collection('lists');

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
