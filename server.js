'use strict';

require('dotenv').config();

var dbname = process.env.DBNAME || 'default-db';
var port = process.env.PORT || 4000;

var http = require('http');
var app = require('./app/app');
var sockets = require('./app/lib/sockets.js');
var connectMongo = require('./app/lib/connect-mongo.js');
var db = require('./app/lib/db.js');

async function start() {
  try {
    var result = await connectMongo(dbname);
    db.setDb(result.db);
    console.log('Connected to MongoDB');

    var server = http.createServer(app);
    server.listen(port, function() {
      console.log('Node server listening. Port: ' + port + ', Database: ' + dbname);
    });

    var io = require('socket.io')(server);
    io.of('/app').on('connection', sockets.connection);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

start();
