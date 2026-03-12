/* global describe, before, beforeEach */
/* jshint expr:true */
// pulled out it
'use strict';

process.env.DBNAME = 'dj-list';

// var expect = require('chai').expect;
// var Mongo = require('mongodb');
var db = require(__dirname + '/../../helpers/db.js');
var factory = require(__dirname + '/../../helpers/factory.js');
var dbState = require(__dirname + '/../../../app/lib/db.js');

var List;

describe.skip('List', function(){
  before(async function(){
    await db();
    List = require(__dirname + '/../../../app/models/list.js');
  }); //before

  beforeEach(async function(){
    try {
      await dbState.getCollection('lists').drop();
    } catch (err) {
      // ignore namespace not found when collection doesn't exist yet
    }
    await factory('list');
  }); //beforeEach



}); //list
