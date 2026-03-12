'use strict';

const path = require('path');
const dbg = require(path.join(__dirname, 'route-debugger.js'));

module.exports = function loadRoutes(app) {
  const home = require(path.join(__dirname, '..', 'routes', 'home.js'));
  const users = require(path.join(__dirname, '..', 'routes', 'users.js'));
  const songs = require(path.join(__dirname, '..', 'routes', 'songs.js'));
  const playlists = require(path.join(__dirname, '..', 'routes', 'playlists.js'));

  app.use(users.lookup);
  app.get('/', dbg, home.index);
  app.get('/api/session', dbg, users.session);
  app.get('/auth/spotify', dbg, users.spotifyStart);
  app.get('/auth/spotify/callback', dbg, users.spotifyCallback);
  if (process.env.NODE_ENV === 'test') {
    app.get('/test/login', dbg, users.testLogin);
  }
  app.use(users.bounce);
  app.post('/logout', dbg, users.logout);
  app.post('/createSong', dbg, songs.create);
  app.post('/key', dbg, songs.key);
  app.post('/bpm', dbg, songs.bpm);
  app.post('/bpmKey', dbg, songs.bpmKey);
  app.post('/guessSearch', dbg, songs.guessSearch);
  app.post('/artistSearch', dbg, songs.artistSearch);
  app.post('/albumSearch', dbg, songs.albumSearch);
  app.post('/songSearch', dbg, songs.songSearch);
  app.post('/search', dbg, songs.search);
  app.post('/genreFilter', dbg, songs.genreFilter);
  app.post('/transpose', dbg, songs.transpose);
  app.put('/editSong', dbg, songs.editSong);
  app.post('/song/:id/fetchPreview', dbg, songs.fetchPreview);
  app.post('/playlists', dbg, playlists.index);
  app.post('/playlists/:id', dbg, playlists.show);
  app.post('/createPlaylist', dbg, playlists.create);
  app.put('/addToPlaylist', dbg, playlists.update);
  app.put('/updateOrder/:id', dbg, playlists.updateOrder);
  app.put('/renamePlaylist', dbg, playlists.rename);
  app.post('/deleteFromPlaylist', dbg, playlists.deleteFromPlaylist);
  app.delete('/deletePlaylist/:id', dbg, playlists.deletePlaylist);

  console.log('Routes Loaded');
};
