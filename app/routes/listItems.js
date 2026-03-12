'use strict';

var ListItem = require(__dirname + '/../models/listItem.js');
var logAndSendError = function(res, err) {
  console.error(err);
  return res.status(500).send({error: 'internal server error'});
};

exports.create = async (req, res)=>{
  try {
    var li = await ListItem.create(req.body.order, req.body.songId, req.body.playlistId);
    res.send({listItem : li});
  } catch (err) {
    return logAndSendError(res, err);
  }
};

exports.destroyListItem = async (req, res)=>{
  try {
    var songs = await ListItem.destroyListItem(req.body.playlistId, req.body.songIds);
    res.send({songs : songs});
  } catch (err) {
    return logAndSendError(res, err);
  }
};
