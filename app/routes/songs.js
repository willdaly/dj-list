'use strict';

const path = require('path');
const Song = require(path.join(__dirname, '..', 'models', 'song.js'));
const { logAndSendError, asyncHandler } = require(path.join(__dirname, '..', 'lib', 'errors.js'));

exports.create = asyncHandler(async (req, res) => {
  const song = await Song.create(req.body);
  res.send({ songs: song });
}, logAndSendError);

exports.key = asyncHandler(async (req, res) => {
  const songs = await Song.findByKey(req.body);
  res.send({ songs });
}, logAndSendError);

exports.bpm = asyncHandler(async (req, res) => {
  const songs = await Song.findByBPM(req.body);
  res.send({ songs });
}, logAndSendError);

exports.bpmKey = asyncHandler(async (req, res) => {
  const songs = await Song.findByBpmKey(req.body);
  res.send({ songs });
}, logAndSendError);

exports.guessSearch = asyncHandler(async (req, res) => {
  const artists = await Song.guessSearch(req.body.typed);
  res.send({ artists });
}, logAndSendError);

exports.artistSearch = asyncHandler(async (req, res) => {
  const songs = await Song.findByArtist(req.body.Artist);
  res.send({ songs });
}, logAndSendError);

exports.albumSearch = asyncHandler(async (req, res) => {
  const songs = await Song.findByAlbum(req.body.Album);
  res.send({ songs });
}, logAndSendError);

exports.songSearch = asyncHandler(async (req, res) => {
  const songs = await Song.findBySong(req.body.Song);
  res.send({ songs });
}, logAndSendError);

exports.search = asyncHandler(async (req, res) => {
  const songs = await Song.findBySearchTerm(req.body.query);
  res.send({ songs });
}, logAndSendError);

exports.genreFilter = asyncHandler(async (req, res) => {
  const songs = await Song.findByGenre(req.body.genre);
  res.send({ songs });
}, logAndSendError);

exports.transpose = asyncHandler(async (req, res) => {
  const songs = await Song.transpose(req.body);
  res.send({ songs });
}, logAndSendError);

exports.editSong = asyncHandler(async (req, res) => {
  const song = await Song.editSong(req.body);
  if (!song) {
    return res.status(404).send({ error: 'song not found' });
  }
  res.send({ song });
}, logAndSendError);
