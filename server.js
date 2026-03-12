'use strict';

require('dotenv').config();

const dbname = process.env.DBNAME || 'default-db';
const port = process.env.PORT || 4000;

const http = require('http');
const app = require('./app/app');
const connectMongo = require('./app/lib/connect-mongo.js');
const db = require('./app/lib/db.js');

async function start() {
  try {
    const result = await connectMongo(dbname);
    db.setDb(result.db);
    console.log('Connected to MongoDB');

    const server = http.createServer(app);
    server.listen(port, () => {
      console.log('Node server listening. Port: ' + port + ', Database: ' + dbname);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

start();
