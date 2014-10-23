'use strict';

var traceur = require('traceur');
var ListItem = traceur.require(__dirname + '/../models/listItem.js');

exports.create = (req, res)=>{
  ListItem.create(req.body.order, req.body.songId, req.body.playlistId, li=>{
    res.send({listItem : li});
  });
};

exports.destroyListItem = (req, res)=>{
  ListItem.destroyListItem(req.body.playlistId, req.body.songIds, songs=>{
    res.send({songs : songs});
  });
};
