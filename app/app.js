'use strict';

var dbname = process.env.DBNAME || 'default-db';
var port = process.env.PORT || 4000;

var express        = require('express');
var less           = require('express-less');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieSession  = require('cookie-session');

/* --- configuration    */
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/* --- pipeline         */
app.use(morgan('dev'));
app.use(express.static(__dirname + '/static'));
app.use('/less', less(__dirname + '/less'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride());
app.use(cookieSession({keys:['SEC123', '321CES']}));

/* --- http server      */
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = `mongodb://localhost/${dbname}`;

MongoClient.connect(mongoUrl, {useUnifiedTopology: true}).then(function(client){
  global.nss = {};
  global.nss.db = client.db(dbname);
  
  console.log('Connected to MongoDB');
  
  // Load routes
  var home = require(__dirname + '/routes/home.js');
  var users = require(__dirname + '/routes/users.js');
  var songs = require(__dirname + '/routes/songs.js');
  var playlists = require(__dirname + '/routes/playlists.js');
  var dbg = require(__dirname + '/lib/route-debugger.js');

  app.use(users.lookup);
  app.get('/', dbg, home.index);
  app.post('/login', dbg, users.login);
  app.post('/users', dbg, users.create);
  app.get('/verify/:id', dbg, users.verify);
  app.post('/verify/:id', dbg, users.password);
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
  
  var server = require('http').createServer(app);
  server.listen(port, function(){
    console.log('Node server listening. Port: ' + port + ', Database: ' + dbname);
  });

  /* --- socket.io        */
  var sockets = require(__dirname + '/lib/sockets.js');
  var io = require('socket.io')(server);
  io.of('/app').on('connection', sockets.connection);
  
}).catch(function(err){
  console.error('MongoDB connection error:', err);
});

module.exports = app;
