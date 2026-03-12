'use strict';

var db = require('./db.js');

exports.mochaHooks = {
  async afterAll() {
    await db.close();
  }
};
