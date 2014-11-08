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

exports.update = (req, res)=>{
  Playlist.addSongs(req.body, playlist=>{
    res.send({playlist : playlist});
  });
};

exports.updateOrder = (req, res)=>{
  Playlist.updateOrder(req.body, playlist=>{
    res.send({playlist : playlist});
  });
};

exports.rename = (req, res)=>{
  Playlist.rename(req.body, playlist=>{
    res.send({playlist : playlist});
  });
};

exports.deleteFromPlaylist = (req, res)=>{
  Playlist.deleteFromPlaylist(req.body.songIds, req.body.playlistId, playlist=>{
    res.send({playlist : playlist});
  });
};

exports.show = (req, res) =>{
  Playlist.show(req.params.id, (songs)=>{
    res.send({songs : songs});
  });
};
