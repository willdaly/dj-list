'use strict';

var Cookies = require('cookies');
var getSessionKeys = require(__dirname + '/session-keys.js');
var sessionKeys = getSessionKeys();

exports.connection = function(socket){
  addUserToSocket(socket);
};

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

function addUserToSocket(socket){
  var cookies = new Cookies(socket.handshake, {}, sessionKeys);
  cookies.get('express:sess');

  // 1. Find user in DB
  // 2. Add user to socket
  // 3. Inform the user they are online

  // EXAMPLE CODE

  // User.findByUserId(obj.userId, user=>{
  //   socket.set('user', user, ()=>{
  //     socket.emit('online');
  //   });
  // });

}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
