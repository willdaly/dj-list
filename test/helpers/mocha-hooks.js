'use strict';

const db = require('./db.js');

exports.mochaHooks = {
  async afterAll() {
    await db.close();
  }
};
