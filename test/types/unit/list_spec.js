/* global describe, before, beforeEach */
/* jshint expr:true */
// pulled out it
'use strict';

process.env.DBNAME = 'dj-list';

// var expect = require('chai').expect;
// var Mongo = require('mongodb');
var db = require(__dirname + '/../../helpers/db.js');
var factory = require(__dirname + '/../../helpers/factory.js');

var List;

describe.skip('List', function(){
  before(function(done){
    db(function(){
      List = require(__dirname + '/../../../app/models/list.js');
      done();
    });
  }); //before

  beforeEach(function(done){
    global.nss.db.collection('lists').drop(function(){
      factory('list', function(lists){
        done();
      });
    });
  }); //beforeEach



}); //list
