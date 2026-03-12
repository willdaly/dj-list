'use strict';

const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const loadRoutes = require(__dirname + '/lib/init-routes.js');
const getSessionKeys = require(__dirname + '/lib/session-keys.js');

function createApp() {
  const sessionKeys = getSessionKeys();
  const app = express();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'pug');

  app.use(morgan('dev'));
  app.use(express.static(__dirname + '/static'));
  app.use(express.urlencoded({extended:true}));
  app.use(cookieSession({keys: sessionKeys}));

  loadRoutes(app);
  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
