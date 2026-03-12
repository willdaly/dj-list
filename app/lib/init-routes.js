'use strict';

var dbg = require(__dirname + '/route-debugger.js');
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
  var home = require(__dirname + '/../routes/home.js');
  var users = require(__dirname + '/../routes/users.js');
  var songs = require(__dirname + '/../routes/songs.js');
  var playlists = require(__dirname + '/../routes/playlists.js');

  app.use(users.lookup);
  app.get('/', dbg, home.index);
  app.post('/login', dbg, users.login);
  app.post('/users', dbg, users.create);
  app.get('/verify/:id', dbg, users.verify);
  app.post('/verify/:id', dbg, users.password);
 app.use(users.bounce); //bounce
  app.post('/logout', dbg, users.logout);
  app.post('/createSong', dbg, songs.create);
  app.post('/key', dbg, songs.key);
  app.post('/bpm', dbg, songs.bpm);
  app.post('/bpmKey', dbg, songs.bpmKey);
  app.post('/guessSearch', dbg, songs.guessSearch);
  app.post('/artistSearch', dbg, songs.artistSearch);
  app.post('/albumSearch', dbg, songs.albumSearch);
  app.post('/songSearch', dbg, songs.songSearch);
  app.post('/genreFilter', dbg, songs.genreFilter);
  app.post('/transpose', dbg, songs.transpose);
  app.put('/editSong', dbg, songs.editSong);
  app.post('/playlists', dbg, playlists.index);
  app.post('/playlists/:id', dbg, playlists.show);
  app.post('/createPlaylist', dbg, playlists.create);
  app.put('/addToPlaylist', dbg, playlists.update);
  app.put('/updateOrder/:id', dbg, playlists.updateOrder);
  app.put('/renamePlaylist', dbg, playlists.rename);
  app.post('/deleteFromPlaylist', dbg, playlists.deleteFromPlaylist);
  app.delete('/deletePlaylist/:id', dbg, playlists.deletePlaylist);


  console.log('Routes Loaded');
  fn();
}
