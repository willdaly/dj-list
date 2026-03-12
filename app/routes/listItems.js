'use strict';

var ListItem = require(__dirname + '/../models/listItem.js');
var logAndSendError = function(res, err) {
  console.error(err);
  return res.status(500).send({error: 'internal server error'});
};

exports.create = (req, res)=>{
  ListItem.create(req.body.order, req.body.songId, req.body.playlistId, (err, li)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({listItem : li});
  });
};

exports.destroyListItem = (req, res)=>{
  ListItem.destroyListItem(req.body.playlistId, req.body.songIds, (err, songs)=>{
    if (err) {
      return logAndSendError(res, err);
    }
    res.send({songs : songs});
  });
};
