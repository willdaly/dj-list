const { MongoClient } = require('mongodb');

async function check() {
  const client = await MongoClient.connect('mongodb://localhost/dj-list');
  const db = client.db();
  const total = await db.collection('songs').countDocuments();
  const withSet = await db.collection('songs').countDocuments({ setCategory: { $exists: true, $ne: null } });
  const withEnergy = await db.collection('songs').countDocuments({ energyTier: { $exists: true, $ne: null } });
  const withCamelot = await db.collection('songs').countDocuments({ camelotCode: { $exists: true, $ne: null } });
  console.log('Total songs:', total);
  console.log('With setCategory:', withSet);
  console.log('With energyTier:', withEnergy);
  console.log('With camelotCode:', withCamelot);
  const sample = await db.collection('songs').findOne({ setCategory: { $exists: true } });
  console.log('Sample with setCategory:', sample ? sample.setCategory : 'NONE FOUND');
  const sample2 = await db.collection('songs').findOne({});
  console.log('Sample song fields:', Object.keys(sample2));
  client.close();
}

check().catch(console.error);
