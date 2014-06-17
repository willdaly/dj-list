/* global describe, before, beforeEach */
/* jshint expr:true */
// pulled out it
'use strict';

process.env.DBNAME = 'dj-list';

// var expect = require('chai').expect;
// var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var factory = traceur.require(__dirname + '/../../helpers/factory.js');

var List;

describe('List', function(){
  before(function(done){
    db(function(){
      List = traceur.require(__dirname + '/../../../app/models/list.js');
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
