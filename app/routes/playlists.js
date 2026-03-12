'use strict';

const Playlist = require(__dirname + '/../models/playlist.js');
const logAndSendError = require(__dirname + '/../lib/errors.js').logAndSendError;

exports.index = async (req, res)=>{
  try {
    const playlists = await Playlist.index(req.session.userId);
    res.send({playlists : playlists});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.create = async (req, res)=>{
  try {
    const playlist = await Playlist.create(req.body, req.session.userId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.deletePlaylist = async (req, res)=>{
  try {
    const playlists = await Playlist.deletePlaylist(req.params.id, req.session.userId);
    res.send({playlists: playlists});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.update = async (req, res)=>{
  try {
    const playlist = await Playlist.addSongs(req.body, req.session.userId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.updateOrder = async (req, res)=>{
  try {
    const playlist = await Playlist.updateOrder(req.body, req.params.id, req.session.userId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.rename = async (req, res)=>{
  try {
    const playlist = await Playlist.rename(req.body, req.session.userId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.deleteFromPlaylist = async (req, res)=>{
  try {
    const playlist = await Playlist.deleteFromPlaylist(req.body.songIds, req.body.playlistId, req.session.userId);
    res.send({playlist : playlist});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.show = async (req, res) =>{
  try {
    const songs = await Playlist.show(req.params.id, req.session.userId);
    res.send({songs : songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};
