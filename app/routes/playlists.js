'use strict';

var traceur = require('traceur');
var Playlist = traceur.require(__dirname + '/../models/playlist.js');

exports.index = (req, res)=>{
  Playlist.index(req.session.userId, playlists=>{
    res.send({playlists : playlists});
  });
};

exports.create = (req, res)=>{
  Playlist.create(req.body, req.session.userId, playlist=>{
    res.send({playlist : playlist});
  });
};

exports.deletePlaylist = (req, res)=>{
  Playlist.deletePlaylist(req.params.id, req.session.userId, playlists=>{
    res.send({playlists: playlists});
  });
};

exports.removeSong = (req, res)=>{
  Playlist.removeSong(req.body.playlistId, req.body.songs, songz=>{
    res.send({song : songz});
  });
};

exports.update = (req, res)=>{
  Playlist.addSongs(req.body.playlistId, req.body.songs, songz=>{
    res.send({songs : songz});
  });
};

exports.show = (req, res) =>{
  Playlist.show(req.params.id, (songs)=>{
    res.send({songs : songs});
  });
};
