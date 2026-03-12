'use strict';

var Song = require(__dirname + '/../models/song.js');
var logAndSendError = function(res, err) {
  console.error(err);
  return res.status(500).send({error: 'internal server error'});
};

exports.create = (req, res)=>{
  Song.create(req.body, (err, song)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs : song});
  });
};

exports.key = (req, res)=>{
  Song.findByKey(req.body, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs : songs});
  });
};

exports.bpm = (req, res)=>{
  Song.findByBPM(req.body, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs : songs});
  });
};

exports.bpmKey = (req, res)=>{
  Song.findByBpmKey(req.body, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs : songs});
  });
};

exports.guessSearch = (req, res)=>{
  Song.guessSearch(req.body.typed, (err, artists)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({artists : artists});
  });
};

exports.artistSearch = (req, res)=>{
  Song.findByArtist(req.body.Artist, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs: songs});
  });
};

exports.albumSearch = (req, res)=>{
  Song.findByAlbum(req.body.Album, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs: songs});
  });
};

exports.songSearch = (req, res)=>{
  Song.findBySong(req.body.Song, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs: songs});
  });
};

exports.genreFilter = (req, res)=>{
  Song.findByGenre(req.body.genre, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs: songs});
  });
};

exports.transpose = (req, res)=>{
  Song.transpose(req.body, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs: songs});
  });
};

exports.editSong = (req, res)=>{
  Song.editSong(req.body, (err, song)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    if (!song) {
      return res.status(404).send({error: 'song not found'});
    }
    res.send({song: song});
  });
};
