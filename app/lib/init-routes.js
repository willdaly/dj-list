'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var users = traceur.require(__dirname + '/../routes/users.js');
  var songs = traceur.require(__dirname + '/../routes/songs.js');
  var playlists = traceur.require(__dirname + '/../routes/playlists.js');

  app.all('*', users.lookup);
  app.get('/', dbg, home.index);
  app.post('/login', dbg, users.login);
  app.post('/users', dbg, users.create);
  app.all('*', users.bounce); //bounce
  app.post('/logout', dbg, users.logout);
  app.get('/songs', dbg, songs.index);
  app.post('/createSong', dbg, songs.create);
  app.post('/key', dbg, songs.key);
  app.post('/bpm', dbg, songs.bpm);
  app.post('/bpmKey', dbg, songs.bpmKey);
  app.post('/artistSearch', dbg, songs.artistSearch);
  app.post('/albumSearch', dbg, songs.albumSearch);
  app.post('/songSearch', dbg, songs.songSearch);
  app.post('/genreFilter', dbg, songs.genreFilter);
  app.post('/transpose', dbg, songs.transpose);
  app.post('/playlists', dbg, playlists.index);
  app.post('/playlists/:id', dbg, playlists.show);
  app.post('/createPlaylist', dbg, playlists.create);
  app.put('/addToPlaylist', dbg, playlists.update);
  app.post('/playlist', dbg, playlists.removeSong);
  app.delete('/deletePlaylist/:id', dbg, playlists.delete);


  console.log('Routes Loaded');
  fn();
}
