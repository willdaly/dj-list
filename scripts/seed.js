'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const connectMongo = require('../app/lib/connect-mongo.js');
const db = require('../app/lib/db.js');
const Song = require('../app/models/song.js');

const dbname = process.env.DBNAME || 'dj-list';

const LIST_DATA_PATH = process.env.LIST_DATA || path.join(__dirname, '..', '..', 'list.json');
const FIXTURE_PATH = path.join(__dirname, '..', 'test', 'fixtures', 'song.json');

function loadRecords() {
  if (fs.existsSync(LIST_DATA_PATH)) {
    const raw = fs.readFileSync(LIST_DATA_PATH, 'utf8');
    const records = JSON.parse(raw);
    return records.map((r) => ({
      Artist: r.Artist,
      Album: r.Album || '',
      Title: r.Song || r.Title,
      BPM: parseInt(r.BPM, 10) || 0,
      Key: r.Key || '',
      genre: r.genre
    }));
  }
  const records = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
  return records.map((r) => ({
    Artist: r.Artist,
    Album: r.Album || '',
    Title: r.Title,
    BPM: parseInt(r.BPM, 10) || 0,
    Key: r.Key || '',
    genre: r.genre
  }));
}

async function seed() {
  const result = await connectMongo(dbname);
  db.setDb(result.db);

  const records = loadRecords();
  console.log(`Loading ${records.length} songs from ${fs.existsSync(LIST_DATA_PATH) ? LIST_DATA_PATH : 'fixtures'}...`);

  const collection = db.getCollection('songs');
  const existing = await collection.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} songs. Run with --force to replace.`);
    if (!process.argv.includes('--force')) {
      await result.client.close();
      process.exit(0);
    }
    await collection.drop();
  }

  const useBulk = records.length > 100;
  if (useBulk) {
    const docs = records.map((r) => ({
      Artist: r.Artist,
      Album: r.Album,
      Song: r.Title,
      BPM: r.BPM,
      Key: r.Key,
      genre: r.genre
    }));
    await collection.insertMany(docs);
  } else {
    for (const record of records) {
      await Song.create({
        Artist: record.Artist,
        Album: record.Album,
        Title: record.Title,
        BPM: record.BPM,
        Key: record.Key,
        genre: record.genre
      });
    }
  }

  console.log(`Seeded ${records.length} songs.`);
  await result.client.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
