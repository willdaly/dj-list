'use strict';

var Song = require(__dirname + '/../models/song.js');
var logAndSendError = require(__dirname + '/../lib/errors.js').logAndSendError;

exports.create = async (req, res)=>{
  try {
    var song = await Song.create(req.body);
    res.send({songs : song});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.key = async (req, res)=>{
  try {
    var songs = await Song.findByKey(req.body);
    res.send({songs : songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.bpm = async (req, res)=>{
  try {
    var songs = await Song.findByBPM(req.body);
    res.send({songs : songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.bpmKey = async (req, res)=>{
  try {
    var songs = await Song.findByBpmKey(req.body);
    res.send({songs : songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.guessSearch = async (req, res)=>{
  try {
    var artists = await Song.guessSearch(req.body.typed);
    res.send({artists : artists});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.artistSearch = async (req, res)=>{
  try {
    var songs = await Song.findByArtist(req.body.Artist);
    res.send({songs: songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.albumSearch = async (req, res)=>{
  try {
    var songs = await Song.findByAlbum(req.body.Album);
    res.send({songs: songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.songSearch = async (req, res)=>{
  try {
    var songs = await Song.findBySong(req.body.Song);
    res.send({songs: songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.search = async (req, res)=>{
  try {
    var songs = await Song.findBySearchTerm(req.body.query);
    res.send({songs: songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.genreFilter = async (req, res)=>{
  try {
    var songs = await Song.findByGenre(req.body.genre);
    res.send({songs: songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.transpose = async (req, res)=>{
  try {
    var songs = await Song.transpose(req.body);
    res.send({songs: songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.editSong = async (req, res)=>{
  try {
    var song = await Song.editSong(req.body);
    if (!song) {
      return res.status(404).send({error: 'song not found'});
    }
    res.send({song: song});
  } catch (err) {
    return logAndSendError(res, err);
  }
};
