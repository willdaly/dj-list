'use strict';

var Playlist = require(__dirname + '/../models/playlist.js');
var logAndSendError = function(res, err) {
  console.error(err);
  return res.status(500).send({error: 'internal server error'});
};

exports.index = (req, res)=>{
  Playlist.index(req.session.userId, (err, playlists)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlists : playlists});
  });
};

exports.create = (req, res)=>{
  Playlist.create(req.body, req.session.userId, (err, playlist)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlist : playlist});
  });
};

exports.deletePlaylist = (req, res)=>{
  Playlist.deletePlaylist(req.params.id, req.session.userId, (err, playlists)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlists: playlists});
  });
};

exports.update = (req, res)=>{
  Playlist.addSongs(req.body, (err, playlist)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlist : playlist});
  });
};

exports.updateOrder = (req, res)=>{
  Playlist.updateOrder(req.body, req.params.id, (err, playlist)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlist : playlist});
  });
};

exports.rename = (req, res)=>{
  Playlist.rename(req.body, (err, playlist)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlist : playlist});
  });
};

exports.deleteFromPlaylist = (req, res)=>{
  Playlist.deleteFromPlaylist(req.body.songIds, req.body.playlistId, (err, playlist)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({playlist : playlist});
  });
};

exports.show = (req, res) =>{
  Playlist.show(req.params.id, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs : songs});
  });
};
