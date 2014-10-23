'use strict';

var traceur = require('traceur');
var ListItem = traceur.require(__dirname + '/../models/listItem.js');

exports.create = (req, res)=>{
  ListItem.create(req.body.order, req.body.songId, req.body.playlistId, li=>{
    res.send({listItem : li});
  });
};
