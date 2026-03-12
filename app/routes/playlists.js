'use strict';

var Playlist = require(__dirname + '/../models/playlist.js');
var logAndSendError = require(__dirname + '/../lib/errors.js').logAndSendError;

exports.index = async (req, res)=>{
  try {
    var playlists = await Playlist.index(req.session.userId);
    res.send({playlists : playlists});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.create = async (req, res)=>{
  try {
    var playlist = await Playlist.create(req.body, req.session.userId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.deletePlaylist = async (req, res)=>{
  try {
    var playlists = await Playlist.deletePlaylist(req.params.id, req.session.userId);
    res.send({playlists: playlists});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.update = async (req, res)=>{
  try {
    var playlist = await Playlist.addSongs(req.body);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.updateOrder = async (req, res)=>{
  try {
    var playlist = await Playlist.updateOrder(req.body, req.params.id);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.rename = async (req, res)=>{
  try {
    var playlist = await Playlist.rename(req.body);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.deleteFromPlaylist = async (req, res)=>{
  try {
    var playlist = await Playlist.deleteFromPlaylist(req.body.songIds, req.body.playlistId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.show = async (req, res) =>{
  try {
    var songs = await Playlist.show(req.params.id);
    res.send({songs : songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};
