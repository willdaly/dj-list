'use strict';

var MongoClient = require('mongodb').MongoClient;

module.exports = function connectMongo(dbname) {
  var mongoUrl = 'mongodb://localhost/' + dbname;

  return MongoClient.connect(mongoUrl, {useUnifiedTopology: true}).then(function(client) {
    var db = client.db(dbname);
    return db.collection('songs').createIndex({Artist: 'text'}).then(function() {
      return {client: client, db: db};
    });
  });
};
