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
  var lists = traceur.require(__dirname + '/../routes/lists.js');
  var playlists = traceur.require(__dirname + '/../routes/playlists.js');

  app.all('*', users.lookup);
  app.get('/', dbg, home.index);

  app.post('/login', dbg, users.login);
  app.post('/users', dbg, users.create);
  //bounce
  app.all('*', users.bounce);
  
  app.post('/logout', dbg, users.logout);



  app.get('/lists', dbg, lists.index);
  app.post('/createSong', dbg, lists.create);
  app.post('/key', dbg, lists.key);
  app.post('/bpm', dbg, lists.bpm);
  app.post('/bpmKey', dbg, lists.bpmKey);
  app.post('/artistSearch', dbg, lists.artistSearch);
  app.post('/albumSearch', dbg, lists.albumSearch);
  app.post('/songSearch', dbg, lists.songSearch);
  app.post('/genreFilter', dbg, lists.genreFilter);
  app.post('/transpose', dbg, lists.transpose);
  app.get('/playlists', dbg, playlists.index);
  app.post('/createPlaylist', dbg, playlists.create);
  app.put('/addToPlaylist', dbg, playlists.update);
  app.get('/playlists/:id', dbg, playlists.show);
  app.post('/playlist', dbg, playlists.removeSong);
  app.delete('/deletePlaylist/:id', dbg, playlists.delete);


  console.log('Routes Loaded');
  fn();
}
