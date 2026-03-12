'use strict';

const path = require('path');
const Playlist = require(path.join(__dirname, '..', 'models', 'playlist.js'));
const { logAndSendError, asyncHandler } = require(path.join(__dirname, '..', 'lib', 'errors.js'));

exports.index = asyncHandler(async (req, res) => {
  const playlists = await Playlist.index(req.session.userId);
  res.send({ playlists });
}, logAndSendError);

exports.create = asyncHandler(async (req, res) => {
  const playlist = await Playlist.create(req.body, req.session.userId);
  res.send({ playlist });
}, logAndSendError);

exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlists = await Playlist.deletePlaylist(req.params.id, req.session.userId);
  res.send({ playlists });
}, logAndSendError);

exports.update = asyncHandler(async (req, res) => {
  const playlist = await Playlist.addSongs(req.body, req.session.userId);
  res.send({ playlist });
}, logAndSendError);

exports.updateOrder = asyncHandler(async (req, res) => {
  const playlist = await Playlist.updateOrder(req.body, req.params.id, req.session.userId);
  res.send({ playlist });
}, logAndSendError);

exports.rename = asyncHandler(async (req, res) => {
  const playlist = await Playlist.rename(req.body, req.session.userId);
  res.send({ playlist });
}, logAndSendError);

exports.deleteFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.deleteFromPlaylist(req.body.songIds, req.body.playlistId, req.session.userId);
  res.send({ playlist });
}, logAndSendError);

exports.show = asyncHandler(async (req, res) => {
  const songs = await Playlist.show(req.params.id, req.session.userId);
  res.send({ songs });
}, logAndSendError);
